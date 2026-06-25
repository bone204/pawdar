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

  async findById(id: string, currentUserId?: string): Promise<any | null> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        reactions: {
          select: {
            userId: true,
            type: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!post) return null;

    const { reactions, _count, ...postData } = post as any;
    
    const reactionStats = reactions.reduce((acc: any, r: any) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {});

    return {
      ...postData,
      reactionsCount: reactions.length,
      reactionStats,
      myReaction: currentUserId ? (reactions.find((r: any) => r.userId === currentUserId)?.type || null) : null,
      commentsCount: _count?.comments ?? 0,
    };
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
    currentUserId?: string,
    targetUserId?: string,
  ): Promise<{ items: any[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const whereClause: any = { status: 'approved' };
    if (targetUserId) {
      whereClause.userId = targetUserId;
    }
    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          reactions: {
            select: {
              userId: true,
              type: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({
        where: whereClause,
      }),
    ]);

    const mappedItems = items.map((item: any) => {
      const { reactions, _count, ...postData } = item;
      const reactionStats = reactions.reduce((acc: any, r: any) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      }, {});
      return {
        ...postData,
        reactionsCount: reactions.length,
        reactionStats,
        myReaction: currentUserId ? (reactions.find((r: any) => r.userId === currentUserId)?.type || null) : null,
        commentsCount: _count?.comments ?? 0,
      };
    });

    return {
      items: mappedItems,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUserId(
    userId: string,
    page: number,
    limit: number,
    currentUserId?: string,
  ): Promise<{ items: any[]; total: number; totalPages: number }> {
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
          reactions: {
            select: {
              userId: true,
              type: true,
            },
          },
          _count: {
            select: {
              comments: true,
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

    const mappedItems = items.map((item: any) => {
      const { reactions, _count, ...postData } = item;
      const reactionStats = reactions.reduce((acc: any, r: any) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      }, {});
      return {
        ...postData,
        reactionsCount: reactions.length,
        reactionStats,
        myReaction: currentUserId ? (reactions.find((r: any) => r.userId === currentUserId)?.type || null) : null,
        commentsCount: _count?.comments ?? 0,
      };
    });

    return {
      items: mappedItems,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async reactToPost(
    postId: string,
    userId: string,
    type: string,
  ): Promise<{ reacted: boolean; type: string | null }> {
    const existingReaction = await this.prisma.postReaction.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Toggle off
        await this.prisma.postReaction.delete({
          where: {
            postId_userId: {
              postId,
              userId,
            },
          },
        });
        return { reacted: false, type: null };
      } else {
        // Update type
        const updated = await this.prisma.postReaction.update({
          where: {
            postId_userId: {
              postId,
              userId,
            },
          },
          data: {
            type,
          },
        });
        return { reacted: true, type: updated.type };
      }
    } else {
      // Create new
      const created = await this.prisma.postReaction.create({
        data: {
          postId,
          userId,
          type,
        },
      });
      return { reacted: true, type: created.type };
    }
  }

  async getPostReactions(
    postId: string,
    type?: string,
    page = 1,
    limit = 10,
  ): Promise<{ items: any[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const whereClause: any = { postId };
    if (type && type !== 'ALL') {
      whereClause.type = type;
    }

    const [items, total] = await Promise.all([
      this.prisma.postReaction.findMany({
        where: whereClause,
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
      this.prisma.postReaction.count({
        where: whereClause,
      }),
    ]);

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createComment(data: {
    postId: string;
    userId: string;
    content: string;
    parentId?: string;
    isApproved?: boolean;
    moderationLabel?: string;
    moderationReason?: string;
  }): Promise<any> {
    return this.prisma.postComment.create({
      data: {
        postId: data.postId,
        userId: data.userId,
        content: data.content,
        parentId: data.parentId,
        isApproved: data.isApproved ?? true,
        moderationLabel: data.moderationLabel,
        moderationReason: data.moderationReason,
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
  }

  async findCommentById(commentId: string): Promise<any | null> {
    return this.prisma.postComment.findUnique({
      where: { id: commentId },
    });
  }

  async deleteComment(commentId: string): Promise<any> {
    return this.prisma.postComment.delete({
      where: { id: commentId },
    });
  }

  async getComments(
    postId: string,
    page: number,
    limit: number,
    currentUserId?: string,
  ): Promise<{ items: any[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    // Chỉ lấy top-level comments (parentId: null)
    // Và điều kiện hiển thị: isApproved = true HOẶC của chính currentUserId (nếu chưa được duyệt)
    const whereClause: any = {
      postId,
      parentId: null,
      OR: [
        { isApproved: true },
        ...(currentUserId ? [{ userId: currentUserId }] : []),
      ],
    };

    const [items, total] = await Promise.all([
      this.prisma.postComment.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          replies: {
            where: {
              OR: [
                { isApproved: true },
                ...(currentUserId ? [{ userId: currentUserId }] : []),
              ],
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
            orderBy: { createdAt: 'asc' }, // Sắp xếp reply tăng dần theo thời gian
          },
        },
        orderBy: { createdAt: 'desc' }, // Comment gốc mới nhất lên đầu
        skip,
        take: limit,
      }),
      this.prisma.postComment.count({
        where: whereClause,
      }),
    ]);

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
