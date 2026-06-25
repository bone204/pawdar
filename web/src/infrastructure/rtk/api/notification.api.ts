import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/infrastructure/http/base-query";

export interface NotificationDto {
  id: string;
  userId: string;
  senderId: string | null;
  type: "FRIEND_REQUEST" | "FRIEND_ACCEPT" | string;
  title: string;
  content: string;
  isRead: boolean;
  referenceId: string | null;
  createdAt: string;
  sender?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    email?: string;
  } | null;
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationDto[], void>({
      query: () => ({
        url: "/notifications",
        method: "GET",
      }),
      providesTags: ["Notification"],
      transformResponse: (response: { success: boolean; data: NotificationDto[] }) => response.data,
    }),

    markAsRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
