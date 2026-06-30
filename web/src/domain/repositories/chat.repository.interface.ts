import { ConversationEntity, MessageEntity, PaginatedMessagesEntity } from "../entities/chat.entity";

export interface IChatRepository {
  getConversations(): Promise<ConversationEntity[]>;
  createConversation(receiverId: string): Promise<ConversationEntity>;
  getMessages(conversationId: string, params?: { cursor?: string; limit?: number }): Promise<PaginatedMessagesEntity>;
  sendMessage(conversationId: string, content: string, type?: 'TEXT' | 'IMAGE'): Promise<MessageEntity>;
  editMessage(messageId: string, content: string): Promise<MessageEntity>;
  revokeMessage(messageId: string): Promise<MessageEntity>;
  markAsRead(conversationId: string): Promise<void>;
}
