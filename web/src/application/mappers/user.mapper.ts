import { UserProfileDto, FriendDto, FriendRequestDto } from "../dto/user.dto";
import { UserEntity, FriendEntity, FriendRequestEntity } from "../../domain/entities/user.entity";

export const userMapper = {
  toEntity(dto: UserProfileDto): UserEntity {
    return {
      id: dto.id,
      email: dto.email,
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      avatarUrl: dto.avatarUrl,
      role: dto.role,
      bio: dto.bio,
      address: dto.address,
      coverUrl: dto.coverUrl,
      createdAt: dto.createdAt,
      isOnline: dto.isOnline,
      lastActiveAt: dto.lastActiveAt,
      pets: dto.pets,
      stats: dto.stats,
      friendship: dto.friendship,
    };
  },

  toEntities(dtos: UserProfileDto[]): UserEntity[] {
    return dtos.map(userMapper.toEntity);
  },

  toFriendEntity(dto: FriendDto): FriendEntity {
    return {
      id: dto.id,
      fullName: dto.fullName,
      avatarUrl: dto.avatarUrl,
      email: dto.email,
      bio: dto.bio,
      address: dto.address,
      isOnline: dto.isOnline,
      lastActiveAt: dto.lastActiveAt,
    };
  },

  toFriendEntities(dtos: FriendDto[]): FriendEntity[] {
    return dtos.map(userMapper.toFriendEntity);
  },

  toFriendRequestEntity(dto: FriendRequestDto): FriendRequestEntity {
    return {
      id: dto.id,
      senderId: dto.senderId,
      receiverId: dto.receiverId,
      status: dto.status,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      sender: dto.sender ? userMapper.toFriendEntity(dto.sender) : undefined,
      receiver: dto.receiver ? userMapper.toFriendEntity(dto.receiver) : undefined,
    };
  },

  toFriendRequestEntities(dtos: FriendRequestDto[]): FriendRequestEntity[] {
    return dtos.map(userMapper.toFriendRequestEntity);
  }
};
