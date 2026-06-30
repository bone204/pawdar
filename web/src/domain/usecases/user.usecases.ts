import { IUserRepository } from "../repositories/user.repository.interface";
import { UserEntity } from "../entities/user.entity";

export class GetMyProfileUseCase {
  constructor(private readonly repo: IUserRepository) {}
  execute() { return this.repo.getMyProfile(); }
}

export class GetUserProfileUseCase {
  constructor(private readonly repo: IUserRepository) {}
  execute(id: string) { return this.repo.getUserProfile(id); }
}

export class UpdateProfileUseCase {
  constructor(private readonly repo: IUserRepository) {}
  execute(body: Partial<UserEntity>) { return this.repo.updateProfile(body); }
}

export class SearchUsersUseCase {
  constructor(private readonly repo: IUserRepository) {}
  execute(query: string) { return this.repo.searchUsers(query); }
}

export class GetUserStatusUseCase {
  constructor(private readonly repo: IUserRepository) {}
  execute(id: string) { return this.repo.getUserStatus(id); }
}

export class SendFriendRequestUseCase {
  constructor(private readonly repo: IUserRepository) {}
  execute(receiverId: string) { return this.repo.sendFriendRequest(receiverId); }
}

export class AcceptFriendRequestUseCase {
  constructor(private readonly repo: IUserRepository) {}
  execute(senderId: string) { return this.repo.acceptFriendRequest(senderId); }
}

export class DeclineFriendRequestUseCase {
  constructor(private readonly repo: IUserRepository) {}
  execute(senderId: string) { return this.repo.declineFriendRequest(senderId); }
}

export class UnfriendUseCase {
  constructor(private readonly repo: IUserRepository) {}
  execute(friendId: string) { return this.repo.unfriend(friendId); }
}

export class GetFriendsUseCase {
  constructor(private readonly repo: IUserRepository) {}
  execute(params?: { search?: string; page?: number; limit?: number }) { return this.repo.getFriends(params); }
}

export class GetReceivedFriendRequestsUseCase {
  constructor(private readonly repo: IUserRepository) {}
  execute() { return this.repo.getReceivedFriendRequests(); }
}

export class GetSentFriendRequestsUseCase {
  constructor(private readonly repo: IUserRepository) {}
  execute() { return this.repo.getSentFriendRequests(); }
}
