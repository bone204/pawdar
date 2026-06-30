import { 
  PostEntity, 
  PaginatedPostEntity,
  PostCommentEntity,
  PaginatedCommentEntity,
  PaginatedReactionEntity 
} from "../entities/post.entity";

export interface IPostRepository {
  getApprovedPosts(params?: { page?: number; limit?: number; search?: string; userId?: string }): Promise<PaginatedPostEntity>;
  getMyPosts(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedPostEntity>;
  getPostById(id: string): Promise<PostEntity>;
  createPost(body: { title: string; content: string; imageUrl?: string; lang?: string }): Promise<PostEntity>;
  updatePost(id: string, body: Partial<{ title: string; content: string; imageUrl?: string; lang?: string }>): Promise<PostEntity>;
  deletePost(id: string): Promise<void>;
  
  reactToPost(id: string, type: string): Promise<{ reacted: boolean; type: string | null }>;
  getPostReactions(postId: string, params?: { type?: string; page?: number; limit?: number }): Promise<PaginatedReactionEntity>;
  
  getPostComments(postId: string, params?: { page?: number; limit?: number }): Promise<PaginatedCommentEntity>;
  createPostComment(postId: string, content: string, parentId?: string, lang?: string): Promise<PostCommentEntity>;
  deletePostComment(commentId: string, postId: string): Promise<void>;
}
