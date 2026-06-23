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
  GALLERY_NOT_FOUND = "gallery_not_found",

  // ── Gallery Success Codes ─────────────────────────────────────────────────
  CREATE_GALLERY_SUCCESSFUL = "create_gallery_successful",
  GET_GALLERY_SUCCESSFUL = "get_gallery_successful",
  GET_GALLERY_DETAIL_SUCCESSFUL = "get_gallery_detail_successful",
  UPDATE_GALLERY_SUCCESSFUL = "update_gallery_successful",
  DELETE_GALLERY_SUCCESSFUL = "delete_gallery_successful",

  // ── Post Success Codes ────────────────────────────────────────────────────
  CREATE_POST_SUCCESSFUL = "create_post_successful",
  GET_MY_POSTS_SUCCESSFUL = "get_my_posts_successful",
  GET_ALL_POSTS_SUCCESSFUL = "get_all_posts_successful",
  GET_POST_DETAIL_SUCCESSFUL = "get_post_detail_successful",
  UPDATE_POST_SUCCESSFUL = "update_post_successful",
  DELETE_POST_SUCCESSFUL = "delete_post_successful",

  // ── Post Error Codes ──────────────────────────────────────────────────────
  POST_NOT_FOUND = "post_not_found",
  FORBIDDEN_POST_ACCESS = "forbidden_post_access",
  POST_MODERATION_FAILED = "post_moderation_failed",
  POST_ALREADY_DELETED = "post_already_deleted",

  // ── Reaction/Comment Success Codes ────────────────────────────────────────
  REACT_POST_SUCCESSFUL = "react_post_successful",
  GET_POST_REACTIONS_SUCCESSFUL = "get_post_reactions_successful",
  CREATE_COMMENT_SUCCESSFUL = "create_comment_successful",
  GET_COMMENTS_SUCCESSFUL = "get_comments_successful",
  DELETE_COMMENT_SUCCESSFUL = "delete_comment_successful",

  // ── Reaction/Comment Error Codes ──────────────────────────────────────────
  COMMENT_NOT_FOUND = "comment_not_found",
  COMMENT_DELETE_FORBIDDEN = "comment_delete_forbidden",
  INVALID_COMMENT_CONTENT = "invalid_comment_content",
  COMMENT_MODERATION_FAILED = "comment_moderation_failed",

  // ── Generic Error Codes ───────────────────────────────────────────────────
  INTERNAL_SERVER_ERROR = "internal_server_error",
  FORBIDDEN = "forbidden",
  UNAUTHORIZED = "unauthorized",
  VALIDATION_ERROR = "validation_error",
  NETWORK_ERROR = "network_error",
  UNKNOWN_ERROR = "unknown_error",
}
