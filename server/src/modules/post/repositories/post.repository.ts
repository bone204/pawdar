import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Post } from '@prisma/client';

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    content: string;
    imageUrl?: string;
    userId: string;
    status: string;
    moderationLabel?: string;
    moderationReason?: string;
  }): Promise<Post> {
    return this.prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
        userId: data.userId,
        status: data.status,
        moderationLabel: data.moderationLabel,
        moderationReason: data.moderationReason,
      },
    });
  }

  async findById(id: string): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { id },
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
  }

  async update(
    id: string,
    data: {
      title?: string;
      content?: string;
      imageUrl?: string;
      status?: string;
      moderationLabel?: string;
      moderationReason?: string | null;
    },
  ): Promise<Post> {
    return this.prisma.post.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Post> {
    return this.prisma.post.delete({
      where: { id },
    });
  }

  async findApproved(
    page: number,
    limit: number,
  ): Promise<{ items: Post[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { status: 'approved' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({
        where: { status: 'approved' },
      }),
    ]);

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Post[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({
        where: { userId },
      }),
    ]);

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
