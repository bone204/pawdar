import { PostEntity, PostCommentEntity, PostReactionEntity } from "../../domain/entities/post.entity";
import { PostResponseDto, PostCommentDto, PostReactionDto } from "../../infrastructure/rtk/api/post.api";

export const postMapper = {
  toEntity(dto: PostResponseDto): PostEntity {
    return {
      id: dto.id,
      title: dto.title,
      content: dto.content,
      imageUrl: dto.imageUrl,
      status: dto.status,
      moderationLabel: dto.moderationLabel,
      moderationReason: dto.moderationReason,
      userId: dto.userId,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      user: dto.user,
      reactionsCount: dto.reactionsCount,
      reactionStats: dto.reactionStats,
      myReaction: dto.myReaction,
      commentsCount: dto.commentsCount,
    };
  },

  toEntities(dtos: PostResponseDto[]): PostEntity[] {
    return dtos.map(postMapper.toEntity);
  },

  toCommentEntity(dto: PostCommentDto): PostCommentEntity {
    return {
      id: dto.id,
      postId: dto.postId,
      userId: dto.userId,
      parentId: dto.parentId,
      content: dto.content,
      isApproved: dto.isApproved,
      moderationLabel: dto.moderationLabel,
      moderationReason: dto.moderationReason,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      user: dto.user,
      replies: dto.replies ? postMapper.toCommentEntities(dto.replies) : undefined,
    };
  },

  toCommentEntities(dtos: PostCommentDto[]): PostCommentEntity[] {
    return dtos.map(postMapper.toCommentEntity);
  },

  toReactionEntity(dto: PostReactionDto): PostReactionEntity {
    return {
      id: dto.id,
      postId: dto.postId,
      userId: dto.userId,
      type: dto.type,
      createdAt: dto.createdAt,
      user: dto.user,
    };
  },

  toReactionEntities(dtos: PostReactionDto[]): PostReactionEntity[] {
    return dtos.map(postMapper.toReactionEntity);
  }
};
