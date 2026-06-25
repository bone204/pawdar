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
  reactionsCount: number;
  reactionStats: Record<string, number>;
  myReaction: string | null;
  commentsCount: number;
}

export interface PostCommentUserDto {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface PostCommentDto {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  content: string;
  isApproved: boolean;
  moderationLabel: string | null;
  moderationReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: PostCommentUserDto;
  replies?: PostCommentDto[];
}

export interface PaginatedCommentResponseDto {
  items: PostCommentDto[];
  total: number;
  totalPages: number;
}

export interface PostReactionUserDto {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface PostReactionDto {
  id: string;
  postId: string;
  userId: string;
  type: string;
  createdAt: string;
  user: PostReactionUserDto;
}

export interface PaginatedReactionResponseDto {
  items: PostReactionDto[];
  total: number;
  totalPages: number;
}

export interface GetPostCommentsQueryDto {
  postId: string;
  page?: number;
  limit?: number;
}

export interface CreatePostCommentRequestDto {
  postId: string;
  content: string;
  parentId?: string;
  lang?: string;
}

export interface GetPostReactionsQueryDto {
  postId: string;
  type?: string;
  page?: number;
  limit?: number;
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
  userId?: string;
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
  tagTypes: ["Post", "Comment"],
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

    reactToPost: builder.mutation<{ reacted: boolean; type: string | null }, { id: string; type: string }>({
      query: ({ id, type }) => ({
        url: `${API_ENDPOINTS.posts.base}/${id}/react`,
        method: "POST",
        body: { type },
      }),
      transformResponse: (response: ApiSuccessResponse<{ reacted: boolean; type: string | null }>) => response.data,
      transformErrorResponse: transformError,
    }),

    getPostReactions: builder.query<PaginatedReactionResponseDto, GetPostReactionsQueryDto>({
      query: ({ postId, ...params }) => ({
        url: `${API_ENDPOINTS.posts.base}/${postId}/reactions`,
        method: "GET",
        params,
      }),
      transformResponse: (response: ApiSuccessResponse<PaginatedReactionResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    getPostComments: builder.query<PaginatedCommentResponseDto, GetPostCommentsQueryDto>({
      query: ({ postId, ...params }) => ({
        url: `${API_ENDPOINTS.posts.base}/${postId}/comments`,
        method: "GET",
        params,
      }),
      providesTags: (result, error, { postId }) => [
        { type: "Comment", id: `LIST_${postId}` },
        ...(result ? result.items.map(({ id }) => ({ type: "Comment" as const, id })) : []),
      ],
      transformResponse: (response: ApiSuccessResponse<PaginatedCommentResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),
    createPostComment: builder.mutation<PostCommentDto, CreatePostCommentRequestDto>({
      query: ({ postId, content, parentId, lang }) => ({
        url: `${API_ENDPOINTS.posts.base}/${postId}/comments`,
        method: "POST",
        body: { content, parentId, lang },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        { type: "Comment", id: `LIST_${postId}` },
      ],
      transformResponse: (response: ApiSuccessResponse<PostCommentDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    deletePostComment: builder.mutation<void, { commentId: string; postId: string }>({
      query: ({ commentId }) => ({
        url: `${API_ENDPOINTS.posts.base}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        { type: "Comment", id: `LIST_${postId}` },
      ],
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
  useReactToPostMutation,
  useGetPostReactionsQuery,
  useGetPostCommentsQuery,
  useCreatePostCommentMutation,
  useDeletePostCommentMutation,
} = postApi;

