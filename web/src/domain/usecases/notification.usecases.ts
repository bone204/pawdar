import { INotificationRepository } from "../repositories/notification.repository.interface";

export class GetNotificationsUseCase {
  constructor(private readonly repo: INotificationRepository) {}
  execute() { return this.repo.getNotifications(); }
}

export class MarkAsReadUseCase {
  constructor(private readonly repo: INotificationRepository) {}
  execute(id: string) { return this.repo.markAsRead(id); }
}

export class MarkAllAsReadUseCase {
  constructor(private readonly repo: INotificationRepository) {}
  execute() { return this.repo.markAllAsRead(); }
}
