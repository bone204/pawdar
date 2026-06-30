import { useMemo } from "react";
import {
  useGetApprovedPostsQuery,
  useGetMyPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useReactToPostMutation,
  useGetPostReactionsQuery,
  useGetPostCommentsQuery,
  useCreatePostCommentMutation,
  useDeletePostCommentMutation,
} from "@/infrastructure/rtk/api/post.api";
import { postMapper } from "@/application/mappers/post.mapper";

export const usePosts = () => {
  const [createMutation, { isLoading: isCreating }] = useCreatePostMutation();
  const [updateMutation, { isLoading: isUpdating }] = useUpdatePostMutation();
  const [deleteMutation, { isLoading: isDeleting }] = useDeletePostMutation();
  const [reactMutation, { isLoading: isReacting }] = useReactToPostMutation();
  const [createCommentMutation, { isLoading: isCommenting }] = useCreatePostCommentMutation();
  const [deleteCommentMutation, { isLoading: isDeletingComment }] = useDeletePostCommentMutation();

  const createPost = async (body: { title: string; content: string; imageUrl?: string; lang?: string }) => {
    const res = await createMutation(body).unwrap();
    return postMapper.toEntity(res);
  };

  const updatePost = async (id: string, body: Partial<{ title: string; content: string; imageUrl?: string; lang?: string }>) => {
    const res = await updateMutation({ id, body }).unwrap();
    return postMapper.toEntity(res);
  };

  const deletePost = async (id: string) => {
    await deleteMutation(id).unwrap();
  };

  const reactToPost = async (id: string, type: string) => {
    return await reactMutation({ id, type }).unwrap();
  };

  const createComment = async (postId: string, content: string, parentId?: string, lang?: string) => {
    const res = await createCommentMutation({ postId, content, parentId, lang }).unwrap();
    return postMapper.toCommentEntity(res);
  };

  const deleteComment = async (commentId: string, postId: string) => {
    await deleteCommentMutation({ commentId, postId }).unwrap();
  };

  return {
    createPost, updatePost, deletePost, reactToPost, createComment, deleteComment,
    isCreating, isUpdating, isDeleting, isReacting, isCommenting, isDeletingComment
  };
};

export const useApprovedPosts = (params?: { page?: number; limit?: number; search?: string; userId?: string }) => {
  const { data: dtoData, isLoading, isFetching, error, refetch } = useGetApprovedPostsQuery(params || {});
  const data = useMemo(() => dtoData ? {
    items: postMapper.toEntities(dtoData.items),
    total: dtoData.total,
    totalPages: dtoData.totalPages,
  } : undefined, [dtoData]);
  return { data, isLoading, isFetching, error, refetch };
};

export const useMyPosts = (params?: { page?: number; limit?: number; search?: string }) => {
  const { data: dtoData, isLoading, isFetching, error, refetch } = useGetMyPostsQuery(params || {});
  const data = useMemo(() => dtoData ? {
    items: postMapper.toEntities(dtoData.items),
    total: dtoData.total,
    totalPages: dtoData.totalPages,
  } : undefined, [dtoData]);
  return { data, isLoading, isFetching, error, refetch };
};

export const usePostDetail = (id: string, skip = false) => {
  const { data: dto, isLoading, error } = useGetPostByIdQuery(id, { skip });
  const data = useMemo(() => dto ? postMapper.toEntity(dto) : undefined, [dto]);
  return { data, isLoading, error };
};

export const usePostComments = (postId: string, params?: { page?: number; limit?: number }, skip = false) => {
  const { data: dtoData, isLoading, error, refetch } = useGetPostCommentsQuery({ postId, ...params }, { skip });
  const data = useMemo(() => dtoData ? {
    items: postMapper.toCommentEntities(dtoData.items),
    total: dtoData.total,
    totalPages: dtoData.totalPages,
  } : undefined, [dtoData]);
  return { data, isLoading, error, refetch };
};

export const usePostReactions = (postId: string, params?: { type?: string; page?: number; limit?: number }, skip = false) => {
  const { data: dtoData, isLoading, error } = useGetPostReactionsQuery({ postId, ...params }, { skip });
  const data = useMemo(() => dtoData ? {
    items: postMapper.toReactionEntities(dtoData.items),
    total: dtoData.total,
    totalPages: dtoData.totalPages,
  } : undefined, [dtoData]);
  return { data, isLoading, error };
};
