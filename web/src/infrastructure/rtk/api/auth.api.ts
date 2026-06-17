// RTK Query slice for authentication - uses endpoints from infrastructure/api/endpoints.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { env } from "@/shared/config/env";
import { API_ENDPOINTS } from "@/infrastructure/api/endpoints";
import {
  SignUpRequestDto,
  SignUpResponseDto,
  ApiSuccessResponse,
  ApiErrorResponse,
} from "@/application/dto/auth.dto";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: env.apiBaseUrl,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
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
  }),
});

export const { useSignUpMutation } = authApi;
