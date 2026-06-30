import { UserDto } from "./auth.dto";

export interface UserProfileDto extends UserDto {
  bio?: string | null;
  address?: string | null;
  coverUrl?: string | null;
  createdAt: string;
  isOnline?: boolean;
  lastActiveAt?: string | null;
  pets: {
    id: string;
    name: string;
    petType: string;
    breedId?: string | null;
    gender: string;
    ageMonths?: number | null;
    weightKg?: number | null;
    avatarUrl?: string | null;
  }[];
  stats: {
    posts: number;
    pets: number;
    friends: number;
  };
  friendship?: {
    status: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'FRIENDS';
    friendshipId: string | null;
  } | null;
}

export interface UpdateProfileRequestDto {
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  address?: string;
}

export interface FriendDto {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  email: string;
  bio?: string | null;
  address?: string | null;
  isOnline?: boolean;
  lastActiveAt?: string | null;
}

export interface FriendshipDto {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED';
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequestDto extends FriendshipDto {
  sender?: FriendDto;
  receiver?: FriendDto;
}

export interface GetFriendsQueryDto {
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedFriendsResponseDto {
  items: FriendDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
