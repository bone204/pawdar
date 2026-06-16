export enum ResponseCode {
  // Success Codes
  SIGNUP_SUCCESSFUL = 'signup_successful',
  EMAIL_VERIFIED = 'email_verified',
  EMAIL_RESENT = 'email_resent',

  // Error Codes
  EMAIL_ALREADY_REGISTERED = 'email_already_registered',
  INVALID_VERIFICATION_TOKEN = 'invalid_verification_token',
  VERIFICATION_TOKEN_EXPIRED = 'verification_token_expired',
  EMAIL_ALREADY_VERIFIED = 'email_already_verified',
  USER_NOT_FOUND = 'user_not_found',
  INTERNAL_SERVER_ERROR = 'internal_server_error',
}
