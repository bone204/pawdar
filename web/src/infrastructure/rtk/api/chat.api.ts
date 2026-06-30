import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/infrastructure/http/base-query";
import { API_ENDPOINTS } from "@/infrastructure/api/endpoints";
import {
  ConversationDto,
  PaginatedMessagesResponseDto,
  GetMessagesQueryDto,
  SendMessageRequestDto,
  EditMessageRequestDto,
  ChatMessageDto,
} from "@/application/dto/chat.dto";
import { ApiSuccessResponse, ApiErrorResponse } from "@/application/dto/auth.dto";

const transformError = (response: any) => {
  const body = response.data as ApiErrorResponse;
  return {
    code: body?.error?.code ?? "unknown_error",
    message: body?.error?.message ?? "An unexpected error occurred",
    details: body?.error?.details,
  };
};

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Conversation", "Message"],
  endpoints: (builder) => ({
    getConversations: builder.query<ConversationDto[], void>({
      query: () => ({
        url: API_ENDPOINTS.chat.conversations,
        method: "GET",
      }),
      providesTags: ["Conversation"],
      transformResponse: (response: ApiSuccessResponse<ConversationDto[]>) => response.data,
      transformErrorResponse: transformError,
    }),

    createConversation: builder.mutation<ConversationDto, string>({
      query: (receiverId) => ({
        url: API_ENDPOINTS.chat.conversations,
        method: "POST",
        body: { receiverId },
      }),
      invalidatesTags: ["Conversation"],
      transformResponse: (response: ApiSuccessResponse<ConversationDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    getMessages: builder.query<PaginatedMessagesResponseDto, { conversationId: string; params?: GetMessagesQueryDto }>({
      query: ({ conversationId, params }) => ({
        url: `${API_ENDPOINTS.chat.conversations}/${conversationId}/messages`,
        method: "GET",
        params,
      }),
      providesTags: (result, error, arg) => [{ type: "Message", id: arg.conversationId }],
      // Transform directly returning the structure { data, meta }
      transformResponse: (response: ApiSuccessResponse<PaginatedMessagesResponseDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    sendMessage: builder.mutation<ChatMessageDto, SendMessageRequestDto>({
      query: (body) => ({
        url: API_ENDPOINTS.chat.messages,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Message", id: arg.conversationId },
        "Conversation",
      ],
      transformResponse: (response: ApiSuccessResponse<ChatMessageDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    editMessage: builder.mutation<ChatMessageDto, { messageId: string; body: EditMessageRequestDto }>({
      query: ({ messageId, body }) => ({
        url: `${API_ENDPOINTS.chat.messages}/${messageId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Message"],
      transformResponse: (response: ApiSuccessResponse<ChatMessageDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    revokeMessage: builder.mutation<ChatMessageDto, string>({
      query: (messageId) => ({
        url: `${API_ENDPOINTS.chat.messages}/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Message"],
      transformResponse: (response: ApiSuccessResponse<ChatMessageDto>) => response.data,
      transformErrorResponse: transformError,
    }),

    markAsRead: builder.mutation<void, string>({
      query: (conversationId) => ({
        url: `${API_ENDPOINTS.chat.conversations}/${conversationId}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Conversation"],
      transformResponse: (response: ApiSuccessResponse<any>) => response.data,
      transformErrorResponse: transformError,
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useCreateConversationMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useEditMessageMutation,
  useRevokeMessageMutation,
  useMarkAsReadMutation,
} = chatApi;
