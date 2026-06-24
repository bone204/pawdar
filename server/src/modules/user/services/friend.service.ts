import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResponseCode } from '../../../common/constants/response-codes';
import { NotificationService } from '../../notification/services/notification.service';

@Injectable()
export class FriendService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new BadRequestException({
        code: ResponseCode.CANNOT_FRIEND_SELF,
        message: 'You cannot send a friend request to yourself',
      });
    }

    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new NotFoundException({
        code: ResponseCode.USER_NOT_FOUND,
        message: 'Receiver user not found',
      });
    }

    // Check if friendship or request already exists
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new BadRequestException({
          code: ResponseCode.ALREADY_FRIENDS,
          message: 'You are already friends with this user',
        });
      }
      throw new BadRequestException({
        code: ResponseCode.FRIEND_REQUEST_ALREADY_EXISTS,
        message: 'A friend request is already pending between you and this user',
      });
    }

    const friendship = await this.prisma.friendship.create({
      data: {
        senderId,
        receiverId,
        status: 'PENDING',
      },
    });

    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
    });

    // Create Notification and trigger realtime via Socket
    await this.notificationService.createNotification({
      userId: receiverId,
      senderId: senderId,
      type: 'FRIEND_REQUEST',
      title: 'Lời mời kết bạn mới',
      content: `${sender?.fullName || 'Ai đó'} đã gửi cho bạn một lời mời kết bạn.`,
      referenceId: friendship.id,
    });

    return friendship;
  }

  async acceptFriendRequest(receiverId: string, senderId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
    });

    if (!friendship || friendship.status !== 'PENDING') {
      throw new NotFoundException({
        code: ResponseCode.FRIEND_REQUEST_NOT_FOUND,
        message: 'Pending friend request not found',
      });
    }

    const updated = await this.prisma.friendship.update({
      where: {
        id: friendship.id,
      },
      data: {
        status: 'ACCEPTED',
      },
    });

    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    // Create Notification and trigger realtime via Socket
    await this.notificationService.createNotification({
      userId: senderId,
      senderId: receiverId,
      type: 'FRIEND_ACCEPT',
      title: 'Đã chấp nhận lời mời kết bạn',
      content: `${receiver?.fullName || 'Ai đó'} đã đồng ý lời mời kết bạn của bạn.`,
      referenceId: friendship.id,
    });

    return updated;
  }

  async declineFriendRequest(receiverId: string, senderId: string) {
    // Can decline or cancel request: meaning the user declining can be receiver or sender
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        status: 'PENDING',
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (!friendship) {
      throw new NotFoundException({
        code: ResponseCode.FRIEND_REQUEST_NOT_FOUND,
        message: 'Pending friend request not found',
      });
    }

    // Identify who is declining: if receiverId is user executing the decline, senderId is the other one
    // We want to notify the other person that their request has been declined or cancelled.
    const targetNotifyId = friendship.senderId === receiverId ? friendship.receiverId : friendship.senderId;
    const actorId = friendship.senderId === receiverId ? friendship.senderId : friendship.receiverId;

    await this.prisma.friendship.delete({
      where: {
        id: friendship.id,
      },
    });

    const actor = await this.prisma.user.findUnique({
      where: { id: actorId },
    });

    // Send a real-time notification to the other user so their UI updates
    await this.notificationService.createNotification({
      userId: targetNotifyId,
      senderId: actorId,
      type: 'FRIEND_DECLINE',
      title: 'Yêu cầu kết bạn đã bị từ chối/hủy',
      content: `${actor?.fullName || 'Ai đó'} đã từ chối hoặc hủy yêu cầu kết bạn.`,
      referenceId: friendship.id,
    });

    return { deleted: true };
  }

  async unfriend(userId: string, friendId: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      },
    });

    if (!friendship) {
      throw new NotFoundException({
        code: ResponseCode.FRIEND_REQUEST_NOT_FOUND,
        message: 'Friendship not found',
      });
    }

    await this.prisma.friendship.delete({
      where: {
        id: friendship.id,
      },
    });

    return { unfriend: true };
  }

  async getFriends(userId: string, search?: string, page: number = 1, limit: number = 10) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });

    const friendIds = friendships.map((f) =>
      f.senderId === userId ? f.receiverId : f.senderId,
    );

    if (friendIds.length === 0) {
      return { items: [], total: 0, page, limit, totalPages: 1 };
    }

    const whereClause: any = {
      id: { in: friendIds },
    };

    if (search) {
      whereClause.fullName = { contains: search, mode: 'insensitive' };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          email: true,
          bio: true,
          address: true,
        },
        skip,
        take: limit,
        orderBy: { fullName: 'asc' },
      }),
      this.prisma.user.count({ where: whereClause }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async getReceivedFriendRequests(userId: string) {
    return this.prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            email: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSentFriendRequests(userId: string) {
    return this.prisma.friendship.findMany({
      where: {
        senderId: userId,
        status: 'PENDING',
      },
      include: {
        receiver: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            email: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
