// Pure domain entities for Post

export interface PostEntity {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  status: string;
  moderationLabel: string | null;
  moderationReason: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  reactionsCount: number;
  reactionStats: Record<string, number>;
  myReaction: string | null;
  commentsCount: number;
}

export interface PostCommentEntity {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  content: string;
  isApproved: boolean;
  moderationLabel: string | null;
  moderationReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  replies?: PostCommentEntity[];
}

export interface PostReactionEntity {
  id: string;
  postId: string;
  userId: string;
  type: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
}

export interface PaginatedPostEntity {
  items: PostEntity[];
  total: number;
  totalPages: number;
}

export interface PaginatedCommentEntity {
  items: PostCommentEntity[];
  total: number;
  totalPages: number;
}

export interface PaginatedReactionEntity {
  items: PostReactionEntity[];
  total: number;
  totalPages: number;
}
