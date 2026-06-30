import { UserEntity, FriendEntity, FriendRequestEntity, PaginatedFriendsEntity } from "../entities/user.entity";

export interface IUserRepository {
  getMyProfile(): Promise<UserEntity>;
  getUserProfile(id: string): Promise<UserEntity>;
  updateProfile(body: Partial<UserEntity>): Promise<UserEntity>;
  searchUsers(query: string): Promise<UserEntity[]>;
  getUserStatus(id: string): Promise<{ id: string; isOnline: boolean; lastActiveAt: string | null }>;
  
  sendFriendRequest(receiverId: string): Promise<void>;
  acceptFriendRequest(senderId: string): Promise<void>;
  declineFriendRequest(senderId: string): Promise<void>;
  unfriend(friendId: string): Promise<void>;
  
  getFriends(params?: { search?: string; page?: number; limit?: number }): Promise<PaginatedFriendsEntity>;
  getReceivedFriendRequests(): Promise<FriendRequestEntity[]>;
  getSentFriendRequests(): Promise<FriendRequestEntity[]>;
}
