import { INotificationRepository } from "@/domain/repositories/notification.repository.interface";
import { NotificationEntity } from "@/domain/entities/notification.entity";
import { notificationMapper } from "@/application/mappers/notification.mapper";
import { notificationApi } from "@/infrastructure/rtk/api/notification.api";
import { store } from "@/infrastructure/rtk/store";

export class RtkNotificationRepository implements INotificationRepository {
  async getNotifications(): Promise<NotificationEntity[]> {
    const res = await store.dispatch(notificationApi.endpoints.getNotifications.initiate());
    if ("error" in res) throw res.error;
    return notificationMapper.toEntities(res.data!);
  }

  async markAsRead(id: string): Promise<void> {
    const res = await store.dispatch(notificationApi.endpoints.markAsRead.initiate(id));
    if ("error" in res) throw res.error;
  }

  async markAllAsRead(): Promise<void> {
    const res = await store.dispatch(notificationApi.endpoints.markAllAsRead.initiate());
    if ("error" in res) throw res.error;
  }
}
