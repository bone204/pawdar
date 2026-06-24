import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../repositories/auth.repository';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { SignUpDto } from '../dto/signup.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendEmailDto } from '../dto/resend-email.dto';
import { LoginDto } from '../dto/login.dto';
import { ResponseCode } from '../../../common/constants/response-codes';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, password, fullName } = signUpDto;

    // Check if user already exists
    const existingUser = await this.authRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException({
        code: ResponseCode.EMAIL_ALREADY_REGISTERED,
        message: 'Email already registered',
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate verification token (valid for 24 hours)
    const verificationToken = crypto.randomUUID();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user in DB
    const user = await this.authRepository.createUser({
      email,
      passwordHash,
      fullName,
      verificationToken,
      verificationExpires,
    });

    // Send verification email
    await this.sendVerificationEmail(email, fullName, verificationToken);

    return {
      success: true,
      code: ResponseCode.SIGNUP_SUCCESSFUL,
      data: {
        userId: user.id,
        verificationToken: verificationToken,
      },
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { token } = verifyEmailDto;

    const user = await this.authRepository.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException({
        code: ResponseCode.INVALID_VERIFICATION_TOKEN,
        message: 'Invalid or expired verification token',
      });
    }

    // Check token expiration
    if (user.verificationExpires && new Date() > user.verificationExpires) {
      throw new BadRequestException({
        code: ResponseCode.VERIFICATION_TOKEN_EXPIRED,
        message: 'Verification token has expired',
      });
    }

    if (user.isEmailVerified) {
      throw new BadRequestException({
        code: ResponseCode.EMAIL_ALREADY_VERIFIED,
        message: 'Email is already verified',
      });
    }

    await this.authRepository.verifyEmail(user.id);

    return {
      success: true,
      code: ResponseCode.EMAIL_VERIFIED,
      data: null,
    };
  }

  async resendEmail(resendEmailDto: ResendEmailDto) {
    const { email } = resendEmailDto;

    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException({
        code: ResponseCode.USER_NOT_FOUND,
        message: 'User with this email does not exist',
      });
    }

    if (user.isEmailVerified) {
      throw new BadRequestException({
        code: ResponseCode.EMAIL_ALREADY_VERIFIED,
        message: 'Email is already verified',
      });
    }

    // Generate new token
    const verificationToken = crypto.randomUUID();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.authRepository.updateVerificationToken(
      user.id,
      verificationToken,
      verificationExpires,
    );

    // Send new verification email
    await this.sendVerificationEmail(email, user.fullName, verificationToken);

    return {
      success: true,
      code: ResponseCode.EMAIL_RESENT,
      data: {
        verificationToken: verificationToken,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException({
        code: ResponseCode.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        code: ResponseCode.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      throw new ForbiddenException({
        code: ResponseCode.USER_NOT_ACTIVE,
        message: 'User account is deactivated',
      });
    }

    if (!user.isEmailVerified) {
      throw new BadRequestException({
        code: ResponseCode.EMAIL_NOT_VERIFIED,
        message: 'Email is not verified. Please verify your email first.',
      });
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      success: true,
      code: ResponseCode.LOGIN_SUCCESSFUL,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'pawdar_refresh_token_secret_key_2026_safe_and_long_enough',
      });

      const userId = payload.sub;
      const user = await this.authRepository.findById(userId);

      if (!user) {
        throw new UnauthorizedException({
          code: ResponseCode.INVALID_REFRESH_TOKEN,
          message: 'Invalid refresh token: user not found',
        });
      }

      if (!user.isActive) {
        throw new ForbiddenException({
          code: ResponseCode.USER_NOT_ACTIVE,
          message: 'User account is deactivated',
        });
      }

      if (!user.isEmailVerified) {
        throw new BadRequestException({
          code: ResponseCode.EMAIL_NOT_VERIFIED,
          message: 'Email is not verified. Please verify your email first.',
        });
      }

      const tokens = await this.generateTokens(user);

      return {
        success: true,
        code: ResponseCode.REFRESH_SUCCESSFUL,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException({
        code: ResponseCode.INVALID_REFRESH_TOKEN,
        message: 'Invalid or expired refresh token',
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async sendVerificationEmail(
    email: string,
    fullName: string,
    token: string,
  ): Promise<void> {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/verify-email?token=${token}`;

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      this.logger.error('BREVO_API_KEY is not configured. Cannot send verification email.');
      // Tùy chọn: in link ra log cho mục đích debug dễ dàng nếu không có API Key
      this.logger.log(`[DEBUG - Verification Link]: ${verifyUrl}`);
      return;
    }

    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@pawdar.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'Pawdar';

    try {
      // Resolve templates directory
      const templateDir = fs.existsSync(path.join(__dirname, 'templates'))
        ? path.join(__dirname, 'templates')
        : path.join(__dirname, '..', '..', '..', 'modules', 'auth', 'templates');
      
      const templatePath = path.join(templateDir, 'verify-email.hbs');
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Email template not found at path: ${templatePath}`);
      }

      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateSource);
      const html = compiledTemplate({
        fullName,
        verifyUrl,
      });

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: senderName,
            email: senderEmail,
          },
          to: [
            {
              email: email,
              name: fullName,
            },
          ],
          subject: '🐾 Verify your Pawdar account',
          htmlContent: html,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Brevo API returned status ${response.status}: ${errorText}`);
      }

      const result = (await response.json()) as { messageId: string };
      this.logger.log(`Verification email sent to ${email} successfully via Brevo. Message ID: ${result.messageId}`);
    } catch (error) {
      // Log error but don't block the response — user already created
      this.logger.error(`Failed to send verification email to ${email}`, error);
      // In dự phòng ra log để vẫn có thể test được nếu gửi thật thất bại
      this.logger.log(`[FALLBACK - Verification Link]: ${verifyUrl}`);
    }
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'pawdar_refresh_token_secret_key_2026_safe_and_long_enough',
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
    });

    return { accessToken, refreshToken };
  }
}
