// Pure domain entities for Chat

export interface MessageEntity {
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

export interface ConversationParticipantEntity {
  userId: string;
  joinedAt: string;
  lastReadAt: string;
  user?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
}

export interface ConversationEntity {
  id: string;
  isGroup: boolean;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipantEntity[];
  messages?: MessageEntity[];
}

export interface PaginatedMessagesEntity {
  data: MessageEntity[];
  meta: {
    hasNextPage: boolean;
    nextCursor: string | null;
  };
}
