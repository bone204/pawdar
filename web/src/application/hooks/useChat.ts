import { useMemo } from "react";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useCreateConversationMutation,
  useSendMessageMutation,
  useEditMessageMutation,
  useRevokeMessageMutation,
  useMarkAsReadMutation,
} from "@/infrastructure/rtk/api/chat.api";
import { chatMapper } from "@/application/mappers/chat.mapper";

export const useChat = () => {
  const [createConvMutation, { isLoading: isCreatingConv }] = useCreateConversationMutation();
  const [sendMessageMutation, { isLoading: isSending }] = useSendMessageMutation();
  const [editMessageMutation, { isLoading: isEditing }] = useEditMessageMutation();
  const [revokeMessageMutation, { isLoading: isRevoking }] = useRevokeMessageMutation();
  const [markReadMutation, { isLoading: isMarkingRead }] = useMarkAsReadMutation();

  const createConversation = async (receiverId: string) => {
    const res = await createConvMutation(receiverId).unwrap();
    return chatMapper.toConversationEntity(res);
  };

  const sendMessage = async (conversationId: string, content: string, type?: "TEXT" | "IMAGE") => {
    const res = await sendMessageMutation({ conversationId, content, type }).unwrap();
    return chatMapper.toMessageEntity(res);
  };

  const editMessage = async (messageId: string, content: string) => {
    const res = await editMessageMutation({ messageId, body: { content } }).unwrap();
    return chatMapper.toMessageEntity(res);
  };

  const revokeMessage = async (messageId: string) => {
    const res = await revokeMessageMutation(messageId).unwrap();
    return chatMapper.toMessageEntity(res);
  };

  const markAsRead = async (conversationId: string) => {
    await markReadMutation(conversationId).unwrap();
  };

  return {
    createConversation, sendMessage, editMessage, revokeMessage, markAsRead,
    isCreatingConv, isSending, isEditing, isRevoking, isMarkingRead
  };
};

export const useConversations = () => {
  const { data: dtoData, isLoading, error, refetch } = useGetConversationsQuery();
  const data = useMemo(() => dtoData ? chatMapper.toConversationEntities(dtoData) : [], [dtoData]);
  return { data, isLoading, error, refetch };
};

export const useMessages = (conversationId: string, params?: { cursor?: string; limit?: number }, skip = false) => {
  const { data: dtoData, isLoading, isFetching, error, refetch } = useGetMessagesQuery({ conversationId, params }, { skip });
  const data = useMemo(() => dtoData ? {
    data: chatMapper.toMessageEntities(dtoData.data),
    meta: dtoData.meta,
  } : undefined, [dtoData]);
  return { data, isLoading, isFetching, error, refetch };
};
