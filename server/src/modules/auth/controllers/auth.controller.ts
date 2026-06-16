import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { SignUpDto } from '../dto/signup.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendEmailDto } from '../dto/resend-email.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully. Please verify your email.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already registered.',
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
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired token.',
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
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Email already verified or user does not exist.',
  })
  async resendEmail(@Body() resendEmailDto: ResendEmailDto) {
    return this.authService.resendEmail(resendEmailDto);
  }
}
