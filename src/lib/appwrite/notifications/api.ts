/* eslint-disable @typescript-eslint/no-explicit-any */

import { appwriteConfig, database } from "../config";

import { INewNotification } from "@/types";
import { Query } from "appwrite";
import { v4 } from "uuid";

// ==================== NOTIFICATIONS CRUD ====================

export async function createNotification(notification: INewNotification) {
  try {
    // Validar se não é auto-interação
    if (notification.recipientUserId === notification.triggerUserId) {
      console.log("Skipping self-notification");
      return null;
    }

    const newNotification = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      v4(),
      {
        type: notification.type,
        recipientUserId: notification.recipientUserId,
        triggerUserId: notification.triggerUserId,
        postId: notification.postId || null,
        commentId: notification.commentId || null,
        parentCommentId: notification.parentCommentId || null,
        message: notification.message,
        isRead: false,
      }
    );

    if (!newNotification) throw Error;

    console.log("Notification created:", newNotification);
    return newNotification;
  } catch (error) {
    console.log("Error creating notification:", error);
    throw error;
  }
}

export async function getNotificationsByUser(userId: string, limit: number = 50) {
  try {
    const notifications = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("recipientUserId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit)
      ]
    );

    if (!notifications) throw Error;

    return notifications;
  } catch (error) {
    console.log("Error getting notifications:", error);
    throw error;
  }
}

export async function getUnreadNotificationsCount(userId: string) {
  try {
    const notifications = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("recipientUserId", userId),
        Query.equal("isRead", false),
        Query.limit(100) // Limite para performance
      ]
    );

    if (!notifications) throw Error;

    return notifications.total || notifications.documents.length;
  } catch (error) {
    console.log("Error getting unread count:", error);
    return 0;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const updatedNotification = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      notificationId,
      {
        isRead: true
      }
    );

    if (!updatedNotification) throw Error;

    return updatedNotification;
  } catch (error) {
    console.log("Error marking notification as read:", error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    // Buscar todas as notificações não lidas
    const unreadNotifications = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("recipientUserId", userId),
        Query.equal("isRead", false),
        Query.limit(100)
      ]
    );

    // Marcar cada uma como lida
    const updatePromises = unreadNotifications.documents.map(notification =>
      database.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.notificationsCollectionId,
        notification.$id,
        { isRead: true }
      )
    );

    await Promise.all(updatePromises);
    
    console.log(`Marked ${unreadNotifications.documents.length} notifications as read`);
    return { success: true, count: unreadNotifications.documents.length };
  } catch (error) {
    console.log("Error marking all notifications as read:", error);
    throw error;
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const statusCode = await database.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      notificationId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log("Error deleting notification:", error);
    throw error;
  }
}

export async function deleteAllReadNotifications(userId: string) {
  try {
    // Buscar todas as notificações lidas
    const readNotifications = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("recipientUserId", userId),
        Query.equal("isRead", true),
        Query.limit(100)
      ]
    );

    // Deletar cada uma
    const deletePromises = readNotifications.documents.map(notification =>
      database.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.notificationsCollectionId,
        notification.$id
      )
    );

    await Promise.all(deletePromises);
    
    console.log(`Deleted ${readNotifications.documents.length} read notifications`);
    return { success: true, count: readNotifications.documents.length };
  } catch (error) {
    console.log("Error deleting read notifications:", error);
    throw error;
  }
}

// ==================== UTILITY FUNCTIONS ====================

export async function cleanupOldNotifications(userId: string, daysOld: number = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldNotifications = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("recipientUserId", userId),
        Query.lessThan("$createdAt", cutoffDate.toISOString()),
        Query.limit(100)
      ]
    );

    const deletePromises = oldNotifications.documents.map(notification =>
      database.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.notificationsCollectionId,
        notification.$id
      )
    );

    await Promise.all(deletePromises);
    
    console.log(`Cleaned up ${oldNotifications.documents.length} old notifications`);
    return { success: true, count: oldNotifications.documents.length };
  } catch (error) {
    console.log("Error cleaning up old notifications:", error);
    throw error;
  }
}

// ==================== MESSAGE BUILDERS ====================

export const buildNotificationMessage = (
  type: 'like' | 'comment' | 'reply',
  triggerUserName: string,
  postTitle?: string
): string => {
  switch (type) {
    case 'like':
      return `${triggerUserName} curtiu seu post "${postTitle}"`;
    
    case 'comment':
      return `${triggerUserName} comentou em seu post "${postTitle}"`;
    
    case 'reply':
      return `${triggerUserName} respondeu seu comentário em "${postTitle}"`;
    
    default:
      return `${triggerUserName} interagiu com seu conteúdo`;
  }
};