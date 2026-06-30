import { FriendDto } from './user.dto';

export interface ChatMessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'SYSTEM';
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
}

export interface ConversationParticipantDto {
  userId: string;
  joinedAt: string;
  lastReadAt: string;
  user?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
}

export interface ConversationDto {
  id: string;
  isGroup: boolean;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipantDto[];
  messages?: ChatMessageDto[]; // Chứa tin nhắn mới nhất
}

export interface GetMessagesQueryDto {
  cursor?: string;
  limit?: number;
}

export interface PaginatedMessagesResponseDto {
  data: ChatMessageDto[];
  meta: {
    hasNextPage: boolean;
    nextCursor: string | null;
  };
}

export interface SendMessageRequestDto {
  conversationId: string;
  content: string;
  type?: 'TEXT' | 'IMAGE';
}

export interface EditMessageRequestDto {
  content: string;
}
