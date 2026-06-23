import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/infrastructure/http/base-query";
import { API_ENDPOINTS } from "@/infrastructure/api/endpoints";
import { ApiSuccessResponse, ApiErrorResponse } from "@/application/dto/auth.dto";

export interface PostUserDto {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface PostResponseDto {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  status: string;
  moderationLabel: string | null;
  moderationReason: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: PostUserDto;
}

export interface PaginatedPostResponseDto {
  items: PostResponseDto[];
  total: number;
  totalPages: number;
}

export interface GetPostsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreatePostRequestDto {
  title: string;
  content: string;
  imageUrl?: string;
  lang?: string;
}

export interface UpdatePostRequestDto {
  id: string;
  body: Partial<CreatePostRequestDto>;
}

const transformError = (response: any) => {
  const body = response.data as ApiErrorResponse;
  return {
    code: body?.error?.code ?? "unknown_error",
    message: body?.error?.message ?? "An unexpected error occurred",
    details: body?.error?.details,
  };
};

export const postApi = createApi({
  reducerPath: "postApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    getApprovedPosts: builder.query<PaginatedPostResponseDto, GetPostsQueryDto>({
      query: (params) => ({
        url: API_ENDPOINTS.posts.base,
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Post" as const, id })),
              { type: "Post", id: "LIST_APPROVED" },
            ]
          : [{ type: "Post", id: "LIST_APPROVED" }],
      transformResponse: (response: ApiSuccessResponse<PaginatedPostResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    getMyPosts: builder.query<PaginatedPostResponseDto, GetPostsQueryDto>({
      query: (params) => ({
        url: API_ENDPOINTS.posts.myPosts,
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Post" as const, id })),
              { type: "Post", id: "LIST_MY" },
            ]
          : [{ type: "Post", id: "LIST_MY" }],
      transformResponse: (response: ApiSuccessResponse<PaginatedPostResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    getPostById: builder.query<PostResponseDto, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.posts.base}/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Post", id }],
      transformResponse: (response: ApiSuccessResponse<PostResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    createPost: builder.mutation<PostResponseDto, CreatePostRequestDto>({
      query: (body) => ({
        url: API_ENDPOINTS.posts.base,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Post", id: "LIST_APPROVED" },
        { type: "Post", id: "LIST_MY" },
      ],
      transformResponse: (response: ApiSuccessResponse<PostResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    updatePost: builder.mutation<PostResponseDto, UpdatePostRequestDto>({
      query: ({ id, body }) => ({
        url: `${API_ENDPOINTS.posts.base}/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Post", id },
        { type: "Post", id: "LIST_APPROVED" },
        { type: "Post", id: "LIST_MY" },
      ],
      transformResponse: (response: ApiSuccessResponse<PostResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    deletePost: builder.mutation<PostResponseDto, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.posts.base}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Post", id },
        { type: "Post", id: "LIST_APPROVED" },
        { type: "Post", id: "LIST_MY" },
      ],
      transformResponse: (response: ApiSuccessResponse<PostResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),
  }),
});

export const {
  useGetApprovedPostsQuery,
  useGetMyPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postApi;
