import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { SignUpDto } from '../dto/signup.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendEmailDto } from '../dto/resend-email.dto';
import { LoginDto } from '../dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully. Please verify your email.',
    schema: {
      example: {
        success: true,
        code: 'signup_successful',
        data: {
          userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          verificationToken: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed.',
    schema: {
      example: {
        success: false,
        error: {
          code: 'bad_request',
          message: 'Validation failed',
          details: [
            'email must be an email',
            'password should not be empty'
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already registered.',
    schema: {
      example: {
        success: false,
        error: {
          code: 'email_already_registered',
          message: 'Email already registered',
        },
      },
    },
  })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user email using the verification token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email verified successfully.',
    schema: {
      example: {
        success: true,
        code: 'email_verified',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid/expired token or email already verified.',
    schema: {
      examples: {
        invalidToken: {
          summary: 'Invalid or expired token',
          value: {
            success: false,
            error: {
              code: 'invalid_verification_token',
              message: 'Invalid or expired verification token',
            },
          },
        },
        tokenExpired: {
          summary: 'Verification token has expired',
          value: {
            success: false,
            error: {
              code: 'verification_token_expired',
              message: 'Verification token has expired',
            },
          },
        },
        alreadyVerified: {
          summary: 'Email is already verified',
          value: {
            success: false,
            error: {
              code: 'email_already_verified',
              message: 'Email is already verified',
            },
          },
        },
      },
    },
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification email to user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Verification email resent successfully.',
    schema: {
      example: {
        success: true,
        code: 'email_resent',
        data: {
          verificationToken: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Email already verified or user does not exist.',
    schema: {
      examples: {
        userNotFound: {
          summary: 'User with this email does not exist',
          value: {
            success: false,
            error: {
              code: 'user_not_found',
              message: 'User with this email does not exist',
            },
          },
        },
        alreadyVerified: {
          summary: 'Email is already verified',
          value: {
            success: false,
            error: {
              code: 'email_already_verified',
              message: 'Email is already verified',
            },
          },
        },
      },
    },
  })
  async resendEmail(@Body() resendEmailDto: ResendEmailDto) {
    return this.authService.resendEmail(resendEmailDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user and return tokens' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully. Tokens generated.',
    schema: {
      example: {
        success: true,
        code: 'login_successful',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMGVlYmM5OS05YzBiLTRlZjgtYmI2ZC02YmI5YmQzODBhMTEiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTYyNDAwMDAwMCwiZXhwIjoxNjI0MDAwOTAwfQ.xxxxxx',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMGVlYmM5OS05YzBiLTRlZjgtYmI2ZC02YmI5YmQzODBhMTEiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTYyNDAwMDAwMCwiZXhwIjoxNjI0NjA0ODAwfQ.yyyyyy',
          user: {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            email: 'user@example.com',
            fullName: 'Nguyen Van A',
            phoneNumber: '+84987654321',
            avatarUrl: 'https://example.com/avatar.png',
            role: 'user',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid email or password.',
    schema: {
      example: {
        success: false,
        error: {
          code: 'invalid_credentials',
          message: 'Invalid email or password',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Email is not verified.',
    schema: {
      example: {
        success: false,
        error: {
          code: 'email_not_verified',
          message: 'Email is not verified. Please verify your email first.',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User account is deactivated.',
    schema: {
      example: {
        success: false,
        error: {
          code: 'user_not_active',
          message: 'User account is deactivated',
        },
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
