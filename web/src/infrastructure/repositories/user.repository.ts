import { IUserRepository } from "@/domain/repositories/user.repository.interface";
import { UserEntity, FriendEntity, FriendRequestEntity, PaginatedFriendsEntity } from "@/domain/entities/user.entity";
import { userMapper } from "@/application/mappers/user.mapper";
import { userApi } from "@/infrastructure/rtk/api/user.api";
import { store } from "@/infrastructure/rtk/store";

export class RtkUserRepository implements IUserRepository {
  async getMyProfile(): Promise<UserEntity> {
    const res = await store.dispatch(userApi.endpoints.getMyProfile.initiate());
    if ("error" in res) throw res.error;
    return userMapper.toEntity(res.data!);
  }

  async getUserProfile(id: string): Promise<UserEntity> {
    const res = await store.dispatch(userApi.endpoints.getUserProfile.initiate(id));
    if ("error" in res) throw res.error;
    return userMapper.toEntity(res.data!);
  }

  async updateProfile(body: Partial<UserEntity>): Promise<UserEntity> {
    const res = await store.dispatch(userApi.endpoints.updateProfile.initiate(body as any));
    if ("error" in res) throw res.error;
    return userMapper.toEntity(res.data!);
  }

  async searchUsers(query: string): Promise<UserEntity[]> {
    const res = await store.dispatch(userApi.endpoints.searchUsers.initiate(query));
    if ("error" in res) throw res.error;
    return userMapper.toEntities(res.data!);
  }

  async getUserStatus(id: string): Promise<{ id: string; isOnline: boolean; lastActiveAt: string | null }> {
    const res = await store.dispatch(userApi.endpoints.getUserStatus.initiate(id));
    if ("error" in res) throw res.error;
    return res.data!;
  }

  async sendFriendRequest(receiverId: string): Promise<void> {
    const res = await store.dispatch(userApi.endpoints.sendFriendRequest.initiate(receiverId));
    if ("error" in res) throw res.error;
  }

  async acceptFriendRequest(senderId: string): Promise<void> {
    const res = await store.dispatch(userApi.endpoints.acceptFriendRequest.initiate(senderId));
    if ("error" in res) throw res.error;
  }

  async declineFriendRequest(senderId: string): Promise<void> {
    const res = await store.dispatch(userApi.endpoints.declineFriendRequest.initiate(senderId));
    if ("error" in res) throw res.error;
  }

  async unfriend(friendId: string): Promise<void> {
    const res = await store.dispatch(userApi.endpoints.unfriend.initiate(friendId));
    if ("error" in res) throw res.error;
  }

  async getFriends(params?: { search?: string; page?: number; limit?: number }): Promise<PaginatedFriendsEntity> {
    const res = await store.dispatch(userApi.endpoints.getFriends.initiate(params || {}));
    if ("error" in res) throw res.error;
    return {
      items: userMapper.toFriendEntities(res.data!.items),
      total: res.data!.total,
      page: res.data!.page,
      limit: res.data!.limit,
      totalPages: res.data!.totalPages,
    };
  }

  async getReceivedFriendRequests(): Promise<FriendRequestEntity[]> {
    const res = await store.dispatch(userApi.endpoints.getReceivedFriendRequests.initiate());
    if ("error" in res) throw res.error;
    return userMapper.toFriendRequestEntities(res.data!);
  }

  async getSentFriendRequests(): Promise<FriendRequestEntity[]> {
    const res = await store.dispatch(userApi.endpoints.getSentFriendRequests.initiate());
    if ("error" in res) throw res.error;
    return userMapper.toFriendRequestEntities(res.data!);
  }
}
