import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ResponseCode } from '../../../common/constants/response-codes';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(targetUserId: string, currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        avatarUrl: true,
        role: true,
        bio: true,
        address: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException({
        code: ResponseCode.USER_NOT_FOUND,
        message: 'User not found',
      });
    }

    // Get count of posts
    const postCount = await this.prisma.post.count({
      where: { userId: targetUserId, status: 'approved' },
    });

    // Get pets list (exclude soft deleted ones)
    const pets = await this.prisma.userPet.findMany({
      where: { userId: targetUserId, deletedAt: null },
      select: {
        id: true,
        name: true,
        petType: true,
        breedId: true,
        gender: true,
        ageMonths: true,
        weightKg: true,
        avatarUrl: true,
      },
    });

    // Get count of friends (status is ACCEPTED)
    const friendCount = await this.prisma.friendship.count({
      where: {
        status: 'ACCEPTED',
        OR: [
          { senderId: targetUserId },
          { receiverId: targetUserId },
        ],
      },
    });

    let friendshipStatus = 'NONE';
    let friendshipId: string | null = null;

    if (targetUserId !== currentUserId) {
      const friendship = await this.prisma.friendship.findFirst({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: currentUserId },
          ],
        },
      });

      if (friendship) {
        friendshipId = friendship.id;
        if (friendship.status === 'ACCEPTED') {
          friendshipStatus = 'FRIENDS';
        } else if (friendship.senderId === currentUserId) {
          friendshipStatus = 'PENDING_SENT';
        } else {
          friendshipStatus = 'PENDING_RECEIVED';
        }
      }
    }

    return {
      ...user,
      pets,
      stats: {
        posts: postCount,
        pets: pets.length,
        friends: friendCount,
      },
      friendship: targetUserId !== currentUserId ? {
        status: friendshipStatus,
        friendshipId,
      } : null,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException({
        code: ResponseCode.USER_NOT_FOUND,
        message: 'User not found',
      });
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        avatarUrl: dto.avatarUrl,
        bio: dto.bio,
        address: dto.address,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        avatarUrl: true,
        role: true,
        bio: true,
        address: true,
        updatedAt: true,
      },
    });
  }
}
