import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SocketGateway } from '../../socket/socket.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async createNotification(data: {
    userId: string;
    senderId?: string;
    type: string;
    title: string;
    content: string;
    referenceId?: string;
  }) {
    // Check if there is an unread duplicate notification of the same type and sender
    if (data.senderId && data.type) {
      const existing = await this.prisma.notification.findFirst({
        where: {
          userId: data.userId,
          senderId: data.senderId,
          type: data.type,
          isRead: false,
        },
      });

      if (existing) {
        // Update existing notification timestamp and content instead of duplicating
        const updated = await this.prisma.notification.update({
          where: { id: existing.id },
          data: {
            content: data.content,
            title: data.title,
            referenceId: data.referenceId,
            createdAt: new Date(),
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        });

        let senderInfo: any = null;
        senderInfo = await this.prisma.user.findUnique({
          where: { id: data.senderId },
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            email: true,
          },
        });

        const payload = {
          ...updated,
          sender: senderInfo,
        };

        this.socketGateway.sendToUser(data.userId, 'notification', payload);
        return payload;
      }
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        senderId: data.senderId,
        type: data.type,
        title: data.title,
        content: data.content,
        referenceId: data.referenceId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Fetch sender info if exists to provide avatar and name on frontend
    let senderInfo: any = null;
    if (data.senderId) {
      senderInfo = await this.prisma.user.findUnique({
        where: { id: data.senderId },
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          email: true,
        },
      });
    }

    const payload = {
      ...notification,
      sender: senderInfo,
    };

    // Emit event via Socket
    this.socketGateway.sendToUser(data.userId, 'notification', payload);

    return payload;
  }

  async getNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Enrich with sender details
    const enriched = await Promise.all(
      notifications.map(async (n) => {
        let sender: any = null;
        if (n.senderId) {
          sender = await this.prisma.user.findUnique({
            where: { id: n.senderId },
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              email: true,
            },
          });
        }
        return {
          ...n,
          sender,
        };
      }),
    );

    return enriched;
  }

  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
