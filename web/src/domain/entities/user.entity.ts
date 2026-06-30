// Pure domain entities for User

export interface UserEntity {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  role: string;
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

export interface FriendEntity {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  email: string;
  bio?: string | null;
  address?: string | null;
  isOnline?: boolean;
  lastActiveAt?: string | null;
}

export interface FriendRequestEntity {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED';
  createdAt: string;
  updatedAt: string;
  sender?: FriendEntity;
  receiver?: FriendEntity;
}

export interface PaginatedFriendsEntity {
  items: FriendEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
