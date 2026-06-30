import { IChatRepository } from "../repositories/chat.repository.interface";

export class GetConversationsUseCase {
  constructor(private readonly repo: IChatRepository) {}
  execute() { return this.repo.getConversations(); }
}

export class CreateConversationUseCase {
  constructor(private readonly repo: IChatRepository) {}
  execute(receiverId: string) { return this.repo.createConversation(receiverId); }
}

export class GetMessagesUseCase {
  constructor(private readonly repo: IChatRepository) {}
  execute(conversationId: string, params?: { cursor?: string; limit?: number }) { 
    return this.repo.getMessages(conversationId, params); 
  }
}

export class SendMessageUseCase {
  constructor(private readonly repo: IChatRepository) {}
  execute(conversationId: string, content: string, type?: 'TEXT' | 'IMAGE') { 
    return this.repo.sendMessage(conversationId, content, type); 
  }
}

export class EditMessageUseCase {
  constructor(private readonly repo: IChatRepository) {}
  execute(messageId: string, content: string) { return this.repo.editMessage(messageId, content); }
}

export class RevokeMessageUseCase {
  constructor(private readonly repo: IChatRepository) {}
  execute(messageId: string) { return this.repo.revokeMessage(messageId); }
}

export class MarkAsReadUseCase {
  constructor(private readonly repo: IChatRepository) {}
  execute(conversationId: string) { return this.repo.markAsRead(conversationId); }
}
