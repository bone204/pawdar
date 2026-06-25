import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/infrastructure/http/base-query";
import { API_ENDPOINTS } from "@/infrastructure/api/endpoints";
import { ApiSuccessResponse, ApiErrorResponse } from "@/application/dto/auth.dto";
import {
  SudokuStageDto,
  SudokuStageDetailDto,
  CreateSudokuRecordDto,
  SudokuLeaderboardDto,
} from "@/application/dto/game.dto";

export const gameApi = createApi({
  reducerPath: "gameApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["SudokuStage", "SudokuLeaderboard"],
  endpoints: (builder) => ({
    getSudokuStages: builder.query<SudokuStageDto[], void>({
      query: () => ({
        url: API_ENDPOINTS.games.sudokuStages,
        method: "GET",
      }),
      providesTags: ["SudokuStage"],
      transformResponse: (response: ApiSuccessResponse<SudokuStageDto[]>) =>
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
    getSudokuStageById: builder.query<SudokuStageDetailDto, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.games.sudokuStages}/${id}`,
        method: "GET",
      }),
      transformResponse: (response: ApiSuccessResponse<SudokuStageDetailDto>) =>
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
    submitSudokuRecord: builder.mutation<any, CreateSudokuRecordDto>({
      query: (body) => ({
        url: API_ENDPOINTS.games.sudokuRecords,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SudokuStage", "SudokuLeaderboard"],
      transformResponse: (response: ApiSuccessResponse<any>) => response.data,
      transformErrorResponse: (response) => {
        const body = response.data as ApiErrorResponse;
        return {
          code: body?.error?.code ?? "unknown_error",
          message: body?.error?.message ?? "An unexpected error occurred",
          details: body?.error?.details,
        };
      },
    }),
    getSudokuLeaderboard: builder.query<SudokuLeaderboardDto[], string | void>({
      query: (difficulty) => ({
        url: API_ENDPOINTS.games.sudokuLeaderboard,
        method: "GET",
        params: difficulty ? { difficulty } : {},
      }),
      providesTags: ["SudokuLeaderboard"],
      transformResponse: (response: ApiSuccessResponse<SudokuLeaderboardDto[]>) =>
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
  useGetSudokuStagesQuery,
  useGetSudokuStageByIdQuery,
  useSubmitSudokuRecordMutation,
  useGetSudokuLeaderboardQuery,
} = gameApi;
