import { NotificationEntity } from "../entities/notification.entity";

export interface INotificationRepository {
  getNotifications(): Promise<NotificationEntity[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
}
