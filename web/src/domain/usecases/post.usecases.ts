import { IPostRepository } from "../repositories/post.repository.interface";

export class GetApprovedPostsUseCase {
  constructor(private readonly repo: IPostRepository) {}
  execute(params?: { page?: number; limit?: number; search?: string; userId?: string }) { return this.repo.getApprovedPosts(params); }
}

export class GetMyPostsUseCase {
  constructor(private readonly repo: IPostRepository) {}
  execute(params?: { page?: number; limit?: number; search?: string }) { return this.repo.getMyPosts(params); }
}

export class GetPostByIdUseCase {
  constructor(private readonly repo: IPostRepository) {}
  execute(id: string) { return this.repo.getPostById(id); }
}

export class CreatePostUseCase {
  constructor(private readonly repo: IPostRepository) {}
  execute(body: { title: string; content: string; imageUrl?: string; lang?: string }) { return this.repo.createPost(body); }
}

export class UpdatePostUseCase {
  constructor(private readonly repo: IPostRepository) {}
  execute(id: string, body: Partial<{ title: string; content: string; imageUrl?: string; lang?: string }>) { return this.repo.updatePost(id, body); }
}

export class DeletePostUseCase {
  constructor(private readonly repo: IPostRepository) {}
  execute(id: string) { return this.repo.deletePost(id); }
}

export class ReactToPostUseCase {
  constructor(private readonly repo: IPostRepository) {}
  execute(id: string, type: string) { return this.repo.reactToPost(id, type); }
}

export class GetPostReactionsUseCase {
  constructor(private readonly repo: IPostRepository) {}
  execute(postId: string, params?: { type?: string; page?: number; limit?: number }) { return this.repo.getPostReactions(postId, params); }
}

export class GetPostCommentsUseCase {
  constructor(private readonly repo: IPostRepository) {}
  execute(postId: string, params?: { page?: number; limit?: number }) { return this.repo.getPostComments(postId, params); }
}

export class CreatePostCommentUseCase {
  constructor(private readonly repo: IPostRepository) {}
  execute(postId: string, content: string, parentId?: string, lang?: string) { return this.repo.createPostComment(postId, content, parentId, lang); }
}

export class DeletePostCommentUseCase {
  constructor(private readonly repo: IPostRepository) {}
  execute(commentId: string, postId: string) { return this.repo.deletePostComment(commentId, postId); }
}
