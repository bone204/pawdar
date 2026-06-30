import { IChatRepository } from "@/domain/repositories/chat.repository.interface";
import { ConversationEntity, MessageEntity, PaginatedMessagesEntity } from "@/domain/entities/chat.entity";
import { chatMapper } from "@/application/mappers/chat.mapper";
import { chatApi } from "@/infrastructure/rtk/api/chat.api";
import { store } from "@/infrastructure/rtk/store";

export class RtkChatRepository implements IChatRepository {
  async getConversations(): Promise<ConversationEntity[]> {
    const res = await store.dispatch(chatApi.endpoints.getConversations.initiate());
    if ("error" in res) throw res.error;
    return chatMapper.toConversationEntities(res.data!);
  }

  async createConversation(receiverId: string): Promise<ConversationEntity> {
    const res = await store.dispatch(chatApi.endpoints.createConversation.initiate(receiverId));
    if ("error" in res) throw res.error;
    return chatMapper.toConversationEntity(res.data!);
  }

  async getMessages(conversationId: string, params?: { cursor?: string; limit?: number }): Promise<PaginatedMessagesEntity> {
    const res = await store.dispatch(chatApi.endpoints.getMessages.initiate({ conversationId, params }));
    if ("error" in res) throw res.error;
    return {
      data: chatMapper.toMessageEntities(res.data!.data),
      meta: res.data!.meta,
    };
  }

  async sendMessage(conversationId: string, content: string, type?: "TEXT" | "IMAGE"): Promise<MessageEntity> {
    const res = await store.dispatch(chatApi.endpoints.sendMessage.initiate({ conversationId, content, type }));
    if ("error" in res) throw res.error;
    return chatMapper.toMessageEntity(res.data!);
  }

  async editMessage(messageId: string, content: string): Promise<MessageEntity> {
    const res = await store.dispatch(chatApi.endpoints.editMessage.initiate({ messageId, body: { content } }));
    if ("error" in res) throw res.error;
    return chatMapper.toMessageEntity(res.data!);
  }

  async revokeMessage(messageId: string): Promise<MessageEntity> {
    const res = await store.dispatch(chatApi.endpoints.revokeMessage.initiate(messageId));
    if ("error" in res) throw res.error;
    return chatMapper.toMessageEntity(res.data!);
  }

  async markAsRead(conversationId: string): Promise<void> {
    const res = await store.dispatch(chatApi.endpoints.markAsRead.initiate(conversationId));
    if ("error" in res) throw res.error;
  }
}
