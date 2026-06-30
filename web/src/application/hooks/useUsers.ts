import { useMemo } from "react";
import {
  useGetMyProfileQuery,
  useGetUserProfileQuery,
  useSearchUsersQuery,
  useGetFriendsQuery,
  useGetReceivedFriendRequestsQuery,
  useGetSentFriendRequestsQuery,
  useUpdateProfileMutation,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useDeclineFriendRequestMutation,
  useUnfriendMutation,
  useGetUserStatusQuery,
} from "@/infrastructure/rtk/api/user.api";
import { userMapper } from "@/application/mappers/user.mapper";
import { UserEntity } from "@/domain/entities/user.entity";

export const useUsers = () => {
  const [updateProfileMutation, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [sendFriendReq, { isLoading: isSending }] = useSendFriendRequestMutation();
  const [acceptFriendReq, { isLoading: isAccepting }] = useAcceptFriendRequestMutation();
  const [declineFriendReq, { isLoading: isDeclining }] = useDeclineFriendRequestMutation();
  const [unfriendMutation, { isLoading: isUnfriending }] = useUnfriendMutation();

  const updateProfile = async (body: Partial<UserEntity>) => {
    const res = await updateProfileMutation(body as any).unwrap();
    return userMapper.toEntity(res);
  };

  const sendFriendRequest = async (receiverId: string) => {
    await sendFriendReq(receiverId).unwrap();
  };

  const acceptFriendRequest = async (senderId: string) => {
    await acceptFriendReq(senderId).unwrap();
  };

  const declineFriendRequest = async (senderId: string) => {
    await declineFriendReq(senderId).unwrap();
  };

  const unfriend = async (friendId: string) => {
    await unfriendMutation(friendId).unwrap();
  };

  return {
    updateProfile, sendFriendRequest, acceptFriendRequest, declineFriendRequest, unfriend,
    isUpdating, isSending, isAccepting, isDeclining, isUnfriending
  };
};

export const useMyProfile = () => {
  const { data: dto, isLoading, error, refetch } = useGetMyProfileQuery();
  const data = useMemo(() => dto ? userMapper.toEntity(dto) : undefined, [dto]);
  return { data, isLoading, error, refetch };
};

export const useUserProfile = (id: string, skip = false) => {
  const { data: dto, isLoading, error, refetch } = useGetUserProfileQuery(id, { skip });
  const data = useMemo(() => dto ? userMapper.toEntity(dto) : undefined, [dto]);
  return { data, isLoading, error, refetch };
};

export const useUserStatus = (id: string, skip = false) => {
  const { data, isLoading, error } = useGetUserStatusQuery(id, { skip });
  return { data, isLoading, error };
};

export const useUserSearch = (query: string, skip = false) => {
  const { data: dtoData, isLoading, error } = useSearchUsersQuery(query, { skip });
  const data = useMemo(() => dtoData ? userMapper.toEntities(dtoData) : [], [dtoData]);
  return { data, isLoading, error };
};

export const useFriends = (params?: { search?: string; page?: number; limit?: number }) => {
  const { data: dtoData, isLoading, isFetching, error, refetch } = useGetFriendsQuery(params || {});
  const data = useMemo(() => dtoData ? {
    items: userMapper.toFriendEntities(dtoData.items),
    total: dtoData.total,
    page: dtoData.page,
    limit: dtoData.limit,
    totalPages: dtoData.totalPages,
  } : undefined, [dtoData]);
  return { data, isLoading, isFetching, error, refetch };
};

export const useFriendRequests = () => {
  const { data: receivedDto, isLoading: isLoadingReceived, refetch: refetchReceived } = useGetReceivedFriendRequestsQuery();
  const { data: sentDto, isLoading: isLoadingSent, refetch: refetchSent } = useGetSentFriendRequestsQuery();

  const received = useMemo(() => receivedDto ? userMapper.toFriendRequestEntities(receivedDto) : [], [receivedDto]);
  const sent = useMemo(() => sentDto ? userMapper.toFriendRequestEntities(sentDto) : [], [sentDto]);

  return { received, sent, isLoading: isLoadingReceived || isLoadingSent, refetchReceived, refetchSent };
};
