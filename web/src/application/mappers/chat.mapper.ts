import { ChatMessageDto, ConversationDto } from "../dto/chat.dto";
import { MessageEntity, ConversationEntity } from "../../domain/entities/chat.entity";

export const chatMapper = {
  toMessageEntity(dto: ChatMessageDto): MessageEntity {
    return {
      id: dto.id,
      conversationId: dto.conversationId,
      senderId: dto.senderId,
      content: dto.content,
      type: dto.type,
      isEdited: dto.isEdited,
      isDeleted: dto.isDeleted,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      sender: dto.sender,
    };
  },

  toMessageEntities(dtos: ChatMessageDto[]): MessageEntity[] {
    return dtos.map(chatMapper.toMessageEntity);
  },

  toConversationEntity(dto: ConversationDto): ConversationEntity {
    return {
      id: dto.id,
      isGroup: dto.isGroup,
      name: dto.name,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      participants: dto.participants,
      messages: dto.messages ? chatMapper.toMessageEntities(dto.messages) : undefined,
    };
  },

  toConversationEntities(dtos: ConversationDto[]): ConversationEntity[] {
    return dtos.map(chatMapper.toConversationEntity);
  }
};
