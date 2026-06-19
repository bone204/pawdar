import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/infrastructure/http/base-query";
import { API_ENDPOINTS } from "@/infrastructure/api/endpoints";
import {
  PetResponseDto,
  PaginatedPetResponseDto,
  GetPetsQueryDto,
  CreatePetRequestDto,
  UpdatePetRequestDto,
  PetGalleryResponseDto,
  CreateGalleryRequestDto,
  UpdateGalleryRequestDto,
  DeleteGalleryRequestDto,
} from "@/application/dto/pet.dto";
import { ApiSuccessResponse, ApiErrorResponse } from "@/application/dto/auth.dto";

const transformError = (response: any) => {
  const body = response.data as ApiErrorResponse;
  return {
    code: body?.error?.code ?? "unknown_error",
    message: body?.error?.message ?? "An unexpected error occurred",
    details: body?.error?.details,
  };
};

export const petApi = createApi({
  reducerPath: "petApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Pet", "PetGallery"],
  endpoints: (builder) => ({
    getPetsMe: builder.query<PaginatedPetResponseDto, GetPetsQueryDto>({
      query: (params) => ({
        url: `${API_ENDPOINTS.pets}/me`,
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Pet" as const, id })),
              { type: "Pet", id: "LIST_ME" },
            ]
          : [{ type: "Pet", id: "LIST_ME" }],
      transformResponse: (response: ApiSuccessResponse<PaginatedPetResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    getPets: builder.query<PaginatedPetResponseDto, GetPetsQueryDto>({
      query: (params) => ({
        url: API_ENDPOINTS.pets,
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Pet" as const, id })),
              { type: "Pet", id: "LIST_ALL" },
            ]
          : [{ type: "Pet", id: "LIST_ALL" }],
      transformResponse: (response: ApiSuccessResponse<PaginatedPetResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    getPetById: builder.query<PetResponseDto, string>({
      query: (id) => ({ url: `${API_ENDPOINTS.pets}/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Pet", id }],
      transformResponse: (response: ApiSuccessResponse<PetResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    createPet: builder.mutation<PetResponseDto, CreatePetRequestDto>({
      query: (body) => ({ url: API_ENDPOINTS.pets, method: "POST", body }),
      invalidatesTags: [{ type: "Pet", id: "LIST_ME" }, { type: "Pet", id: "LIST_ALL" }],
      transformResponse: (response: ApiSuccessResponse<PetResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    updatePet: builder.mutation<PetResponseDto, UpdatePetRequestDto>({
      query: ({ id, body }) => ({ url: `${API_ENDPOINTS.pets}/${id}`, method: "PATCH", body }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Pet", id },
        { type: "Pet", id: "LIST_ME" },
        { type: "Pet", id: "LIST_ALL" },
      ],
      transformResponse: (response: ApiSuccessResponse<PetResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    deletePet: builder.mutation<PetResponseDto, string>({
      query: (id) => ({ url: `${API_ENDPOINTS.pets}/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "Pet", id },
        { type: "Pet", id: "LIST_ME" },
        { type: "Pet", id: "LIST_ALL" },
      ],
      transformResponse: (response: ApiSuccessResponse<PetResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    // --- Pet Gallery Endpoints ---
    getPetGallery: builder.query<PetGalleryResponseDto[], string>({
      query: (petId) => ({ url: `${API_ENDPOINTS.pets}/${petId}/gallery`, method: "GET" }),
      providesTags: (result, error, petId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "PetGallery" as const, id })),
              { type: "PetGallery", id: `LIST_${petId}` },
            ]
          : [{ type: "PetGallery", id: `LIST_${petId}` }],
      transformResponse: (response: ApiSuccessResponse<PetGalleryResponseDto[]>) => response.data,
      transformErrorResponse: transformError,
    }),

    createPetGallery: builder.mutation<PetGalleryResponseDto, CreateGalleryRequestDto>({
      query: ({ petId, body }) => ({
        url: `${API_ENDPOINTS.pets}/${petId}/gallery`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { petId }) => [
        { type: "Pet", id: petId },
        { type: "PetGallery", id: `LIST_${petId}` },
      ],
      transformResponse: (response: ApiSuccessResponse<PetGalleryResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    updatePetGallery: builder.mutation<PetGalleryResponseDto, UpdateGalleryRequestDto>({
      query: ({ petId, id, body }) => ({
        url: `${API_ENDPOINTS.pets}/${petId}/gallery/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { petId, id }) => [
        { type: "Pet", id: petId },
        { type: "PetGallery", id },
        { type: "PetGallery", id: `LIST_${petId}` },
      ],
      transformResponse: (response: ApiSuccessResponse<PetGalleryResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    deletePetGallery: builder.mutation<PetGalleryResponseDto, DeleteGalleryRequestDto>({
      query: ({ petId, id }) => ({
        url: `${API_ENDPOINTS.pets}/${petId}/gallery/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { petId, id }) => [
        { type: "Pet", id: petId },
        { type: "PetGallery", id },
        { type: "PetGallery", id: `LIST_${petId}` },
      ],
      transformResponse: (response: ApiSuccessResponse<PetGalleryResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),
  }),
});

export const {
  useGetPetsMeQuery,
  useGetPetsQuery,
  useGetPetByIdQuery,
  useCreatePetMutation,
  useUpdatePetMutation,
  useDeletePetMutation,
  useGetPetGalleryQuery,
  useCreatePetGalleryMutation,
  useUpdatePetGalleryMutation,
  useDeletePetGalleryMutation,
} = petApi;
