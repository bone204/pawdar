import { IPostRepository } from "@/domain/repositories/post.repository.interface";
import { PostEntity, PaginatedPostEntity, PostCommentEntity, PaginatedCommentEntity, PaginatedReactionEntity } from "@/domain/entities/post.entity";
import { postMapper } from "@/application/mappers/post.mapper";
import { postApi } from "@/infrastructure/rtk/api/post.api";
import { store } from "@/infrastructure/rtk/store";

export class RtkPostRepository implements IPostRepository {
  async getApprovedPosts(params?: { page?: number; limit?: number; search?: string; userId?: string }): Promise<PaginatedPostEntity> {
    const res = await store.dispatch(postApi.endpoints.getApprovedPosts.initiate(params || {}));
    if ("error" in res) throw res.error;
    return {
      items: postMapper.toEntities(res.data!.items),
      total: res.data!.total,
      totalPages: res.data!.totalPages,
    };
  }

  async getMyPosts(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedPostEntity> {
    const res = await store.dispatch(postApi.endpoints.getMyPosts.initiate(params || {}));
    if ("error" in res) throw res.error;
    return {
      items: postMapper.toEntities(res.data!.items),
      total: res.data!.total,
      totalPages: res.data!.totalPages,
    };
  }

  async getPostById(id: string): Promise<PostEntity> {
    const res = await store.dispatch(postApi.endpoints.getPostById.initiate(id));
    if ("error" in res) throw res.error;
    return postMapper.toEntity(res.data!);
  }

  async createPost(body: { title: string; content: string; imageUrl?: string; lang?: string }): Promise<PostEntity> {
    const res = await store.dispatch(postApi.endpoints.createPost.initiate(body));
    if ("error" in res) throw res.error;
    return postMapper.toEntity(res.data!);
  }

  async updatePost(id: string, body: Partial<{ title: string; content: string; imageUrl?: string; lang?: string }>): Promise<PostEntity> {
    const res = await store.dispatch(postApi.endpoints.updatePost.initiate({ id, body }));
    if ("error" in res) throw res.error;
    return postMapper.toEntity(res.data!);
  }

  async deletePost(id: string): Promise<void> {
    const res = await store.dispatch(postApi.endpoints.deletePost.initiate(id));
    if ("error" in res) throw res.error;
  }

  async reactToPost(id: string, type: string): Promise<{ reacted: boolean; type: string | null }> {
    const res = await store.dispatch(postApi.endpoints.reactToPost.initiate({ id, type }));
    if ("error" in res) throw res.error;
    return res.data!;
  }

  async getPostReactions(postId: string, params?: { type?: string; page?: number; limit?: number }): Promise<PaginatedReactionEntity> {
    const res = await store.dispatch(postApi.endpoints.getPostReactions.initiate({ postId, ...params }));
    if ("error" in res) throw res.error;
    return {
      items: postMapper.toReactionEntities(res.data!.items),
      total: res.data!.total,
      totalPages: res.data!.totalPages,
    };
  }

  async getPostComments(postId: string, params?: { page?: number; limit?: number }): Promise<PaginatedCommentEntity> {
    const res = await store.dispatch(postApi.endpoints.getPostComments.initiate({ postId, ...params }));
    if ("error" in res) throw res.error;
    return {
      items: postMapper.toCommentEntities(res.data!.items),
      total: res.data!.total,
      totalPages: res.data!.totalPages,
    };
  }

  async createPostComment(postId: string, content: string, parentId?: string, lang?: string): Promise<PostCommentEntity> {
    const res = await store.dispatch(postApi.endpoints.createPostComment.initiate({ postId, content, parentId, lang }));
    if ("error" in res) throw res.error;
    return postMapper.toCommentEntity(res.data!);
  }

  async deletePostComment(commentId: string, postId: string): Promise<void> {
    const res = await store.dispatch(postApi.endpoints.deletePostComment.initiate({ commentId, postId }));
    if ("error" in res) throw res.error;
  }
}
