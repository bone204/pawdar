import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { SendMessageDto, CreateConversationDto, GetMessagesDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async getConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => p.userId !== userId)?.user;
      return {
        ...conv,
        otherParticipant: !conv.isGroup ? otherParticipant : null,
      };
    });
  }

  async getMessages(conversationId: string, userId: string, query: GetMessagesDto) {
    const isParticipant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!isParticipant) {
      throw new NotFoundException('Conversation not found or you are not a participant');
    }

    const limit = query.limit ? parseInt(query.limit, 10) : 20;

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      take: limit + 1, // Lấy dư 1 để check xem có trang tiếp theo không
      ...(query.cursor && {
        cursor: { id: query.cursor },
        skip: 1, // Bỏ qua cursor element
      }),
      orderBy: { createdAt: 'desc' }, // Thường load tin nhắn mới nhất trước
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    let hasNextPage = false;
    let nextCursor: string | null = null;

    if (messages.length > limit) {
      hasNextPage = true;
      const nextMessage = messages.pop(); // Loại bỏ phần tử dư thừa
      if (nextMessage) {
        nextCursor = nextMessage.id;
      }
    }

    return {
      data: messages.reverse(), // Đảo ngược lại để hiển thị từ cũ tới mới ở giao diện
      meta: {
        hasNextPage,
        nextCursor,
      },
    };
  }

  async createOrGetDirectConversation(userId: string, createDto: CreateConversationDto) {
    const { receiverId } = createDto;

    if (userId === receiverId) {
      throw new BadRequestException('Cannot start a conversation with yourself');
    }

    const existingConversations = await this.prisma.conversation.findMany({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: receiverId } } },
        ],
      },
      include: {
        participants: {
          include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (existingConversations.length > 0) {
      return existingConversations[0];
    }

    const newConversation = await this.prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId },
            { userId: receiverId },
          ],
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
        },
        messages: true,
      },
    });

    return newConversation;
  }

  async sendMessage(userId: string, sendDto: SendMessageDto) {
    const { conversationId, content, type } = sendDto;

    const isParticipant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!isParticipant) {
      throw new NotFoundException('Conversation not found or you are not a participant');
    }

    // Chuẩn Enterprise: Gộp việc gửi tin nhắn và cập nhật thời gian thành một Transaction
    const message = await this.prisma.$transaction(async (tx) => {
      const newMessage = await tx.message.create({
        data: {
          conversationId,
          senderId: userId,
          content,
          type: type || 'TEXT',
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return newMessage;
    });

    const participants = await this.prisma.conversationParticipant.findMany({
      where: { conversationId },
      select: { userId: true },
    });

    // Phát sự kiện real-time cho các thành viên trong room
    participants.forEach((p) => {
      this.socketGateway.sendToUser(p.userId, 'receive_message', message);
    });

    return message;
  }

  async markAsRead(conversationId: string, userId: string) {
    const result = await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { updatedCount: result.count };
  }

  async editMessage(userId: string, messageId: string, content: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new BadRequestException('You can only edit your own messages');
    }

    if (message.isDeleted) {
      throw new BadRequestException('Cannot edit a deleted message');
    }

    if (message.type !== 'TEXT') {
      throw new BadRequestException('Only text messages can be edited');
    }

    const updatedMessage = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Notify participants
    const participants = await this.prisma.conversationParticipant.findMany({
      where: { conversationId: message.conversationId },
      select: { userId: true },
    });

    participants.forEach((p) => {
      this.socketGateway.sendToUser(p.userId, 'edit_message', updatedMessage);
    });

    return updatedMessage;
  }

  async revokeMessage(userId: string, messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new BadRequestException('You can only revoke your own messages');
    }

    if (message.isDeleted) {
      throw new BadRequestException('Message is already deleted');
    }

    const revokedMessage = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        content: 'This message was revoked', // Optional: clear content or replace with placeholder
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Notify participants
    const participants = await this.prisma.conversationParticipant.findMany({
      where: { conversationId: message.conversationId },
      select: { userId: true },
    });

    participants.forEach((p) => {
      this.socketGateway.sendToUser(p.userId, 'revoke_message', revokedMessage);
    });

    return revokedMessage;
  }
}
