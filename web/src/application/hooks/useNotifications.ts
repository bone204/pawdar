import { useMemo } from "react";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "@/infrastructure/rtk/api/notification.api";
import { notificationMapper } from "@/application/mappers/notification.mapper";

export const useNotifications = (skip = false) => {
  const { data: dtoData, isLoading, error, refetch } = useGetNotificationsQuery(undefined, { skip });
  const [markReadMutation, { isLoading: isMarkingRead }] = useMarkAsReadMutation();
  const [markAllReadMutation, { isLoading: isMarkingAllRead }] = useMarkAllAsReadMutation();

  const data = useMemo(() => dtoData ? notificationMapper.toEntities(dtoData) : [], [dtoData]);

  const markAsRead = async (id: string) => {
    await markReadMutation(id).unwrap();
  };

  const markAllAsRead = async () => {
    await markAllReadMutation().unwrap();
  };

  return { data, isLoading, error, refetch, markAsRead, markAllAsRead, isMarkingRead, isMarkingAllRead };
};
