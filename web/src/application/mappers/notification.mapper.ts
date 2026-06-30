import { NotificationDto } from "../../infrastructure/rtk/api/notification.api";
import { NotificationEntity } from "../../domain/entities/notification.entity";

export const notificationMapper = {
  toEntity(dto: NotificationDto): NotificationEntity {
    return {
      id: dto.id,
      userId: dto.userId,
      senderId: dto.senderId,
      type: dto.type,
      title: dto.title,
      content: dto.content,
      isRead: dto.isRead,
      referenceId: dto.referenceId,
      createdAt: dto.createdAt,
      sender: dto.sender,
    };
  },

  toEntities(dtos: NotificationDto[]): NotificationEntity[] {
    return dtos.map(notificationMapper.toEntity);
  }
};
