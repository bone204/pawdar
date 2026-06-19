// RTK Query slice for breeds

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/infrastructure/http/base-query";
import { API_ENDPOINTS } from "@/infrastructure/api/endpoints";
import { BreedResponseDto, GetBreedsQueryDto, PaginatedBreedResponseDto } from "@/application/dto/breed.dto";
import { ApiSuccessResponse, ApiErrorResponse } from "@/application/dto/auth.dto";

export const breedApi = createApi({
  reducerPath: "breedApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    getBreeds: builder.query<PaginatedBreedResponseDto, GetBreedsQueryDto>({
      query: (params) => ({
        url: API_ENDPOINTS.breeds,
        method: "GET",
        params,
      }),
      // Unwrap the server's unified response: { success, code, data }
      transformResponse: (response: ApiSuccessResponse<PaginatedBreedResponseDto>) =>
        response.data,
      // Normalize server error
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

export const { useGetBreedsQuery, useLazyGetBreedsQuery } = breedApi;
