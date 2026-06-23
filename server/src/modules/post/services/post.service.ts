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

  async getApproved(page = 1, limit = 8) {
    return this.postRepository.findApproved(page, limit);
  }

  async getMyPosts(userId: string, page = 1, limit = 8) {
    return this.postRepository.findByUserId(userId, page, limit);
  }

  async getById(id: string) {
    const post = await this.postRepository.findById(id);
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
}
