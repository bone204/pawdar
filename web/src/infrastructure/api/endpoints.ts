// Centralized API endpoint definitions - all server routes in one place.
// Keep in sync with server route definitions.

export const API_ENDPOINTS = {
  auth: {
    signUp: "/auth/signup",
    verifyEmail: "/auth/verify-email",
    resendEmail: "/auth/resend-email",
    login: "/auth/login",
    refresh: "/auth/refresh",
  },
} as const;
