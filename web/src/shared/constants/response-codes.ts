// Response codes shared with the server - keep in sync with:
// server/src/common/constants/response-codes.ts

export enum ResponseCode {
  // ── Auth Success Codes ────────────────────────────────────────────────────
  SIGNUP_SUCCESSFUL = "signup_successful",
  EMAIL_VERIFIED = "email_verified",
  EMAIL_RESENT = "email_resent",
  LOGIN_SUCCESSFUL = "login_successful",
  REFRESH_SUCCESSFUL = "refresh_successful",

  // ── Breed Success Codes ───────────────────────────────────────────────────
  GET_BREEDS_SUCCESSFUL = "get_breeds_successful",
  GET_BREED_DETAIL_SUCCESSFUL = "get_breed_detail_successful",
  BREED_SYNC_SUCCESSFUL = "breed_sync_successful",

  // ── Pet Success Codes ─────────────────────────────────────────────────────
  CREATE_PET_SUCCESSFUL = "create_pet_successful",
  GET_MY_PETS_SUCCESSFUL = "get_my_pets_successful",
  GET_ALL_PETS_SUCCESSFUL = "get_all_pets_successful",
  GET_PET_DETAIL_SUCCESSFUL = "get_pet_detail_successful",
  UPDATE_PET_SUCCESSFUL = "update_pet_successful",
  DELETE_PET_SUCCESSFUL = "delete_pet_successful",

  // ── Auth Error Codes ──────────────────────────────────────────────────────
  EMAIL_ALREADY_REGISTERED = "email_already_registered",
  INVALID_VERIFICATION_TOKEN = "invalid_verification_token",
  VERIFICATION_TOKEN_EXPIRED = "verification_token_expired",
  EMAIL_ALREADY_VERIFIED = "email_already_verified",
  USER_NOT_FOUND = "user_not_found",
  INVALID_CREDENTIALS = "invalid_credentials",
  USER_NOT_ACTIVE = "user_not_active",
  EMAIL_NOT_VERIFIED = "email_not_verified",
  INVALID_REFRESH_TOKEN = "invalid_refresh_token",

  // ── Breed Error Codes ─────────────────────────────────────────────────────
  BREED_NOT_FOUND = "breed_not_found",

  // ── Pet Error Codes ───────────────────────────────────────────────────────
  PET_NOT_FOUND = "pet_not_found",
  FORBIDDEN_PET_ACCESS = "forbidden_pet_access",
  PET_ALREADY_DELETED = "pet_already_deleted",

  // ── Generic Error Codes ───────────────────────────────────────────────────
  INTERNAL_SERVER_ERROR = "internal_server_error",
  FORBIDDEN = "forbidden",
  UNAUTHORIZED = "unauthorized",
  VALIDATION_ERROR = "validation_error",
  NETWORK_ERROR = "network_error",
  UNKNOWN_ERROR = "unknown_error",
}
