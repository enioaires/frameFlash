import {
  cleanupOldNotifications,
  createNotification,
  deleteAllReadNotifications,
  deleteNotification,
  getNotificationsByUser,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from "@/lib/appwrite/notifications/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { INewNotification } from "@/types";
import { QUERY_KEYS } from "../queryKeys";

// ==================== QUERY HOOKS ====================

export const useGetNotifications = (userId: string, limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, userId, limit],
    queryFn: () => getNotificationsByUser(userId, limit),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
  });
};

export const useGetUnreadCount = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_UNREAD_COUNT, userId],
    queryFn: () => getUnreadNotificationsCount(userId),
    enabled: !!userId,
    refetchInterval: 30 * 1000, // Auto-refresh a cada 30 segundos
    staleTime: 15 * 1000, // 15 segundos
    gcTime: 1 * 60 * 1000, // 1 minuto
  });
};

// ==================== MUTATION HOOKS ====================

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notification: INewNotification) => createNotification(notification),
    onSuccess: (_data, variables) => {
      // Invalidar notificações do destinatário
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, variables.recipientUserId],
      });
      
      // Invalidar contador de não lidas
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_UNREAD_COUNT, variables.recipientUserId],
      });
    },
    onError: (error) => {
      console.error("Error creating notification:", error);
    }
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ notificationId }: { notificationId: string; userId: string }) => 
      markNotificationAsRead(notificationId),
    onSuccess: (_data, variables) => {
      // Invalidar lista de notificações
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, variables.userId],
      });
      
      // Invalidar contador
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_UNREAD_COUNT, variables.userId],
      });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => markAllNotificationsAsRead(userId),
    onSuccess: (_data, variables) => {
      // Invalidar todas as queries de notificação para este usuário
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, variables],
      });
      
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_UNREAD_COUNT, variables],
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ notificationId }: { notificationId: string; userId: string }) => 
      deleteNotification(notificationId),
    onSuccess: (_data, variables) => {
      // Invalidar lista de notificações
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, variables.userId],
      });
      
      // Invalidar contador
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_UNREAD_COUNT, variables.userId],
      });
    },
  });
};

export const useDeleteAllRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => deleteAllReadNotifications(userId),
    onSuccess: (_data, variables) => {
      // Invalidar todas as queries de notificação para este usuário
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, variables],
      });
      
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_UNREAD_COUNT, variables],
      });
    },
  });
};

export const useCleanupOldNotifications = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, daysOld }: { userId: string; daysOld?: number }) => 
      cleanupOldNotifications(userId, daysOld),
    onSuccess: (_data, variables) => {
      // Invalidar queries após limpeza
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, variables.userId],
      });
      
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_UNREAD_COUNT, variables.userId],
      });
    },
  });
};

// ==================== UTILITY HOOKS ====================

export const useNotificationActions = () => {
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const deleteAllRead = useDeleteAllRead();
  
  return {
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
    deleteAllRead: deleteAllRead.mutate,
    isLoading: markAsRead.isPending || markAllAsRead.isPending || 
               deleteNotification.isPending || deleteAllRead.isPending,
  };
};