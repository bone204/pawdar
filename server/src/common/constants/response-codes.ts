export enum ResponseCode {
  // Success Codes
  SIGNUP_SUCCESSFUL = 'signup_successful',
  EMAIL_VERIFIED = 'email_verified',
  EMAIL_RESENT = 'email_resent',
  LOGIN_SUCCESSFUL = 'login_successful',
  REFRESH_SUCCESSFUL = 'refresh_successful',
  GET_BREEDS_SUCCESSFUL = 'get_breeds_successful',
  GET_BREED_DETAIL_SUCCESSFUL = 'get_breed_detail_successful',

  // Error Codes
  EMAIL_ALREADY_REGISTERED = 'email_already_registered',
  INVALID_VERIFICATION_TOKEN = 'invalid_verification_token',
  VERIFICATION_TOKEN_EXPIRED = 'verification_token_expired',
  EMAIL_ALREADY_VERIFIED = 'email_already_verified',
  USER_NOT_FOUND = 'user_not_found',
  INVALID_CREDENTIALS = 'invalid_credentials',
  USER_NOT_ACTIVE = 'user_not_active',
  EMAIL_NOT_VERIFIED = 'email_not_verified',
  INVALID_REFRESH_TOKEN = 'invalid_refresh_token',
  INTERNAL_SERVER_ERROR = 'internal_server_error',
}
