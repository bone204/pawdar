// RTK Query slice for authentication - uses endpoints from infrastructure/api/endpoints.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/infrastructure/http/base-query";
import { API_ENDPOINTS } from "@/infrastructure/api/endpoints";
import {
  SignUpRequestDto,
  SignUpResponseDto,
  VerifyEmailRequestDto,
  VerifyEmailResponseDto,
  ResendEmailRequestDto,
  ResendEmailResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
  ApiSuccessResponse,
  ApiErrorResponse,
} from "@/application/dto/auth.dto";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    signUp: builder.mutation<SignUpResponseDto, SignUpRequestDto>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.signUp,
        method: "POST",
        body,
      }),
      // Unwrap the server's unified response: { success, code, data }
      transformResponse: (response: ApiSuccessResponse<SignUpResponseDto>) =>
        response.data,
      // Normalize server error: { success, error: { code, message } }
      transformErrorResponse: (response) => {
        const body = response.data as ApiErrorResponse;
        return {
          code: body?.error?.code ?? "unknown_error",
          message: body?.error?.message ?? "An unexpected error occurred",
          details: body?.error?.details,
        };
      },
    }),

    verifyEmail: builder.mutation<VerifyEmailResponseDto, VerifyEmailRequestDto>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.verifyEmail,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiSuccessResponse<VerifyEmailResponseDto>) =>
        response.data,
      transformErrorResponse: (response) => {
        const body = response.data as ApiErrorResponse;
        return {
          code: body?.error?.code ?? "unknown_error",
          message: body?.error?.message ?? "An unexpected error occurred",
          details: body?.error?.details,
        };
      },
    }),

    resendEmail: builder.mutation<ResendEmailResponseDto, ResendEmailRequestDto>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.resendEmail,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiSuccessResponse<ResendEmailResponseDto>) =>
        response.data,
      transformErrorResponse: (response) => {
        const body = response.data as ApiErrorResponse;
        return {
          code: body?.error?.code ?? "unknown_error",
          message: body?.error?.message ?? "An unexpected error occurred",
          details: body?.error?.details,
        };
      },
    }),

    login: builder.mutation<LoginResponseDto, LoginRequestDto>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.login,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiSuccessResponse<LoginResponseDto>) =>
        response.data,
      transformErrorResponse: (response) => {
        const body = response.data as ApiErrorResponse;
        return {
          code: body?.error?.code ?? "unknown_error",
          message: body?.error?.message ?? "An unexpected error occurred",
          details: body?.error?.details,
        };
      },
    }),

    refresh: builder.mutation<RefreshTokenResponseDto, void>({
      query: () => ({
        url: API_ENDPOINTS.auth.refresh,
        method: "POST",
      }),
      transformResponse: (response: ApiSuccessResponse<RefreshTokenResponseDto>) =>
        response.data,
      transformErrorResponse: (response) => {
        const body = response.data as ApiErrorResponse;
        return {
          code: body?.error?.code ?? "unknown_error",
          message: body?.error?.message ?? "An unexpected error occurred",
          details: body?.error?.details,
        };
      },
    }),
  }),
});

export const {
  useSignUpMutation,
  useVerifyEmailMutation,
  useResendEmailMutation,
  useLoginMutation,
  useRefreshMutation,
} = authApi;
