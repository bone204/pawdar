// Pure domain entities for Notification

export interface NotificationEntity {
  id: string;
  userId: string;
  senderId: string | null;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  referenceId: string | null;
  createdAt: string;
  sender?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    email?: string;
  } | null;
}
