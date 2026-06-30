import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/infrastructure/http/base-query";
import { API_ENDPOINTS } from "@/infrastructure/api/endpoints";
import {
  UserProfileDto,
  UpdateProfileRequestDto,
  PaginatedFriendsResponseDto,
  GetFriendsQueryDto,
  FriendRequestDto,
} from "@/application/dto/user.dto";
import { ApiSuccessResponse, ApiErrorResponse } from "@/application/dto/auth.dto";
import { postApi } from "./post.api";

const transformError = (response: any) => {
  const body = response.data as ApiErrorResponse;
  return {
    code: body?.error?.code ?? "unknown_error",
    message: body?.error?.message ?? "An unexpected error occurred",
    details: body?.error?.details,
  };
};

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["UserProfile", "Friends", "ReceivedFriendRequests", "SentFriendRequests"],
  endpoints: (builder) => ({
    getMyProfile: builder.query<UserProfileDto, void>({
      query: () => ({
        url: API_ENDPOINTS.user.profile,
        method: "GET",
      }),
      providesTags: ["UserProfile"],
      transformResponse: (response: ApiSuccessResponse<UserProfileDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    getUserProfile: builder.query<UserProfileDto, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.user.profile}/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "UserProfile", id }],
      transformResponse: (response: ApiSuccessResponse<UserProfileDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    updateProfile: builder.mutation<UserProfileDto, UpdateProfileRequestDto>({
      query: (body) => ({
        url: API_ENDPOINTS.user.profile,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["UserProfile"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(postApi.util.invalidateTags(["Post", "Comment"]));
        } catch (err) {}
      },
      transformResponse: (response: ApiSuccessResponse<UserProfileDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    sendFriendRequest: builder.mutation<any, string>({
      query: (receiverId) => ({
        url: `${API_ENDPOINTS.user.friends}/request/${receiverId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, receiverId) => [
        "SentFriendRequests",
        { type: "UserProfile", id: receiverId },
      ],
      transformResponse: (response: ApiSuccessResponse<any>) => response.data,
      transformErrorResponse: transformError,
    }),

    acceptFriendRequest: builder.mutation<any, string>({
      query: (senderId) => ({
        url: `${API_ENDPOINTS.user.friends}/accept/${senderId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, senderId) => [
        "ReceivedFriendRequests",
        "Friends",
        "UserProfile",
        { type: "UserProfile", id: senderId },
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate Notification cache from notificationApi
          dispatch(
            { type: "notificationApi/invalidateTags", payload: ["Notification"] }
          );
        } catch (err) {}
      },
      transformResponse: (response: ApiSuccessResponse<any>) => response.data,
      transformErrorResponse: transformError,
    }),

    declineFriendRequest: builder.mutation<any, string>({
      query: (senderId) => ({
        url: `${API_ENDPOINTS.user.friends}/decline/${senderId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, senderId) => [
        "ReceivedFriendRequests",
        "SentFriendRequests",
        "UserProfile",
        { type: "UserProfile", id: senderId },
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate Notification cache from notificationApi
          dispatch(
            { type: "notificationApi/invalidateTags", payload: ["Notification"] }
          );
        } catch (err) {}
      },
      transformResponse: (response: ApiSuccessResponse<any>) => response.data,
      transformErrorResponse: transformError,
    }),

    unfriend: builder.mutation<any, string>({
      query: (friendId) => ({
        url: `${API_ENDPOINTS.user.friends}/${friendId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, friendId) => [
        "Friends",
        "UserProfile",
        { type: "UserProfile", id: friendId },
      ],
      transformResponse: (response: ApiSuccessResponse<any>) => response.data,
      transformErrorResponse: transformError,
    }),

    getFriends: builder.query<PaginatedFriendsResponseDto, GetFriendsQueryDto>({
      query: (params) => ({
        url: API_ENDPOINTS.user.friends,
        method: "GET",
        params,
      }),
      providesTags: ["Friends"],
      transformResponse: (response: ApiSuccessResponse<PaginatedFriendsResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    getReceivedFriendRequests: builder.query<FriendRequestDto[], void>({
      query: () => ({
        url: `${API_ENDPOINTS.user.friends}/requests/received`,
        method: "GET",
      }),
      providesTags: ["ReceivedFriendRequests"],
      transformResponse: (response: ApiSuccessResponse<FriendRequestDto[]>) => response.data,
      transformErrorResponse: transformError,
    }),

    getSentFriendRequests: builder.query<FriendRequestDto[], void>({
      query: () => ({
        url: `${API_ENDPOINTS.user.friends}/requests/sent`,
        method: "GET",
      }),
      providesTags: ["SentFriendRequests"],
      transformResponse: (response: ApiSuccessResponse<FriendRequestDto[]>) => response.data,
      transformErrorResponse: transformError,
    }),

    searchUsers: builder.query<UserProfileDto[], string>({
      query: (search) => ({
        url: `${API_ENDPOINTS.user.profile.replace('/profile', '')}/search`,
        method: "GET",
        params: { q: search },
      }),
      transformResponse: (response: ApiSuccessResponse<UserProfileDto[]>) => response.data,
      transformErrorResponse: transformError,
    }),

    getUserStatus: builder.query<{ id: string; isOnline: boolean; lastActiveAt: string | null }, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.user.profile}/${id}/status`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "UserProfile", id }],
      transformResponse: (response: ApiSuccessResponse<any>) => response.data,
      transformErrorResponse: transformError,
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useGetUserProfileQuery,
  useUpdateProfileMutation,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useDeclineFriendRequestMutation,
  useUnfriendMutation,
  useGetFriendsQuery,
  useGetReceivedFriendRequestsQuery,
  useGetSentFriendRequestsQuery,
  useSearchUsersQuery,
  useGetUserStatusQuery,
} = userApi;
