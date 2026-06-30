import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDto,
  ) {
    try {
      const userId = client.data.userId;
      if (!userId) {
        this.logger.warn(`User ID not found in client data. Cannot send message.`);
        return { status: 'error', message: 'Unauthorized socket' };
      }

      const message = await this.chatService.sendMessage(userId, payload);
      return { status: 'success', data: message };
    } catch (error) {
      this.logger.error(`Error sending message via socket: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    try {
      const userId = client.data.userId;
      if (!userId) return { status: 'error', message: 'Unauthorized' };

      const result = await this.chatService.markAsRead(payload.conversationId, userId);
      return { status: 'success', data: result };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('edit_message')
  async handleEditMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { messageId: string; content: string },
  ) {
    try {
      const userId = client.data.userId;
      if (!userId) return { status: 'error', message: 'Unauthorized' };

      const message = await this.chatService.editMessage(userId, payload.messageId, payload.content);
      return { status: 'success', data: message };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('revoke_message')
  async handleRevokeMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { messageId: string },
  ) {
    try {
      const userId = client.data.userId;
      if (!userId) return { status: 'error', message: 'Unauthorized' };

      const message = await this.chatService.revokeMessage(userId, payload.messageId);
      return { status: 'success', data: message };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
