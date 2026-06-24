import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { ModerationService } from './moderation.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { Post } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly moderationService: ModerationService,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    const { lang, ...postData } = createPostDto;
    const moderationResult = await this.moderationService.moderateContent(
      postData.title,
      postData.content,
      lang,
    );

    const post = await this.postRepository.create({
      ...postData,
      userId,
      status: moderationResult.isApproved ? 'approved' : 'rejected',
      moderationLabel: moderationResult.label,
      moderationReason: moderationResult.reason,
    });

    if (!moderationResult.isApproved) {
      throw new BadRequestException({
        code: 'post_moderation_failed',
        message:
          moderationResult.reason ||
          'Nội dung bài viết vi phạm chính sách kiểm duyệt.',
        postId: post.id,
      });
    }

    return post;
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
  ): Promise<Post> {
    const existingPost = await this.postRepository.findById(id);
    if (!existingPost) {
      throw new NotFoundException({
        code: 'post_not_found',
        message: 'Không tìm thấy bài viết.',
      });
    }

    if (existingPost.userId !== userId) {
      throw new ForbiddenException({
        code: 'post_update_forbidden',
        message: 'Bạn không có quyền chỉnh sửa bài viết này.',
      });
    }

    const { lang, ...updateData } = updatePostDto;

    const titleToModerate =
      updateData.title !== undefined
        ? updateData.title
        : existingPost.title;
    const contentToModerate =
      updateData.content !== undefined
        ? updateData.content
        : existingPost.content;

    const moderationResult = await this.moderationService.moderateContent(
      titleToModerate,
      contentToModerate,
      lang,
    );

    const updatedPost = await this.postRepository.update(id, {
      ...updateData,
      status: moderationResult.isApproved ? 'approved' : 'rejected',
      moderationLabel: moderationResult.label,
      moderationReason: moderationResult.isApproved
        ? null
        : moderationResult.reason,
    });

    if (!moderationResult.isApproved) {
      throw new BadRequestException({
        code: 'post_moderation_failed',
        message:
          moderationResult.reason ||
          'Nội dung bài viết vi phạm chính sách kiểm duyệt.',
        postId: updatedPost.id,
      });
    }

    return updatedPost;
  }

  async getApproved(page = 1, limit = 8, currentUserId?: string, targetUserId?: string) {
    return this.postRepository.findApproved(page, limit, currentUserId, targetUserId);
  }

  async getMyPosts(userId: string, page = 1, limit = 8, currentUserId?: string) {
    return this.postRepository.findByUserId(userId, page, limit, currentUserId);
  }

  async getById(id: string, currentUserId?: string) {
    const post = await this.postRepository.findById(id, currentUserId);
    if (!post) {
      throw new NotFoundException({
        code: 'post_not_found',
        message: 'Không tìm thấy bài viết.',
      });
    }
    return post;
  }

  async delete(id: string, userId: string) {
    const existingPost = await this.postRepository.findById(id);
    if (!existingPost) {
      throw new NotFoundException({
        code: 'post_not_found',
        message: 'Không tìm thấy bài viết.',
      });
    }

    if (existingPost.userId !== userId) {
      throw new ForbiddenException({
        code: 'post_delete_forbidden',
        message: 'Bạn không có quyền xóa bài viết này.',
      });
    }

    return this.postRepository.delete(id);
  }

  async reactToPost(postId: string, userId: string, type: string) {
    const existingPost = await this.postRepository.findById(postId);
    if (!existingPost) {
      throw new NotFoundException({
        code: 'post_not_found',
        message: 'Không tìm thấy bài viết.',
      });
    }
    return this.postRepository.reactToPost(postId, userId, type);
  }

  async getPostReactions(postId: string, type?: string, page = 1, limit = 10) {
    const existingPost = await this.postRepository.findById(postId);
    if (!existingPost) {
      throw new NotFoundException({
        code: 'post_not_found',
        message: 'Không tìm thấy bài viết.',
      });
    }
    return this.postRepository.getPostReactions(postId, type, page, limit);
  }

  async addComment(postId: string, userId: string, content: string, parentId?: string, lang = 'vi') {
    const existingPost = await this.postRepository.findById(postId);
    if (!existingPost) {
      throw new NotFoundException({
        code: 'post_not_found',
        message: 'Không tìm thấy bài viết.',
      });
    }

    if (!content || content.trim() === '') {
      throw new BadRequestException({
        code: 'invalid_comment_content',
        message: 'Nội dung bình luận không được để trống.',
      });
    }

    if (parentId) {
      const parentComment = await this.postRepository.findCommentById(parentId);
      if (!parentComment) {
        throw new NotFoundException({
          code: 'parent_comment_not_found',
          message: 'Không tìm thấy bình luận gốc để trả lời.',
        });
      }
      if (parentComment.postId !== postId) {
        throw new BadRequestException({
          code: 'comment_post_mismatch',
          message: 'Bình luận trả lời phải thuộc cùng bài viết.',
        });
      }
    }

    // AI Moderation cho comment
    const moderationResult = await this.moderationService.moderateComment(content, lang);

    const comment = await this.postRepository.createComment({
      postId,
      userId,
      content,
      parentId,
      isApproved: moderationResult.isApproved,
      moderationLabel: moderationResult.label,
      moderationReason: moderationResult.reason,
    });

    if (!moderationResult.isApproved) {
      throw new BadRequestException({
        code: 'comment_moderation_failed',
        message: moderationResult.reason || 'Bình luận vi phạm tiêu chuẩn cộng đồng.',
        comment,
      });
    }

    return comment;
  }

  async getComments(postId: string, page = 1, limit = 10, currentUserId?: string) {
    const existingPost = await this.postRepository.findById(postId);
    if (!existingPost) {
      throw new NotFoundException({
        code: 'post_not_found',
        message: 'Không tìm thấy bài viết.',
      });
    }
    return this.postRepository.getComments(postId, page, limit, currentUserId);
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.postRepository.findCommentById(commentId);
    if (!comment) {
      throw new NotFoundException({
        code: 'comment_not_found',
        message: 'Không tìm thấy bình luận.',
      });
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException({
        code: 'comment_delete_forbidden',
        message: 'Bạn không có quyền xóa bình luận này.',
      });
    }

    return this.postRepository.deleteComment(commentId);
  }
}
