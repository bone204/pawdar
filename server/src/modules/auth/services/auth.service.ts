import { Injectable, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { AuthRepository } from '../repositories/auth.repository';
import { SignUpDto } from '../dto/signup.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendEmailDto } from '../dto/resend-email.dto';
import { ResponseCode } from '../../../common/constants/response-codes';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly authRepository: AuthRepository) {}

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

    // Mock sending email
    this.logger.log(`Verification email sent to ${email}. Token: ${verificationToken}`);

    return {
      success: true,
      code: ResponseCode.SIGNUP_SUCCESSFUL,
      data: {
        userId: user.id,
        devVerificationToken: verificationToken,
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

    // Mock sending email
    this.logger.log(`New verification email sent to ${email}. Token: ${verificationToken}`);

    return {
      success: true,
      code: ResponseCode.EMAIL_RESENT,
      data: {
        devVerificationToken: verificationToken,
      },
    };
  }
}
