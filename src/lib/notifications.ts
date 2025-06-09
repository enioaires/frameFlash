import { QUERY_KEYS } from "@/lib/react-query/queryKeys";
import { QueryClient } from "@tanstack/react-query";
import { getPostById } from "@/lib/appwrite/posts/api";
import { getUserById } from "@/lib/appwrite/auth/api";

interface NotificationData {
  triggerUser: any;
  recipientUser: any;
  post: any;
}

export const ensureNotificationData = async (
  queryClient: QueryClient,
  triggerUserId: string,
  recipientUserId: string,
  postId: string
): Promise<NotificationData | null> => {
  try {
    console.log('🔔 Ensuring notification data...', { triggerUserId, recipientUserId, postId });

    let triggerUser = null;
    let recipientUser = null;
    let post = null;

    // 1. Buscar usuário que triggou (do cache primeiro, API como fallback)
    const usersCache = queryClient.getQueryData([QUERY_KEYS.GET_USERS]) as any;
    triggerUser = usersCache?.documents?.find((u: any) => u.$id === triggerUserId);
    
    if (!triggerUser) {
      console.log('🔄 Trigger user not in cache, fetching from API...');
      triggerUser = await getUserById(triggerUserId);
    }

    if (!triggerUser) {
      console.error('❌ Trigger user not found:', triggerUserId);
      return null;
    }

    // 2. Buscar usuário destinatário
    recipientUser = usersCache?.documents?.find((u: any) => u.$id === recipientUserId);
    
    if (!recipientUser) {
      console.log('🔄 Recipient user not in cache, fetching from API...');
      recipientUser = await getUserById(recipientUserId);
    }

    if (!recipientUser) {
      console.error('❌ Recipient user not found:', recipientUserId);
      return null;
    }

    // 3. Buscar dados do post
    post = queryClient.getQueryData([QUERY_KEYS.GET_POST_BY_ID, postId]) as any;
    
    if (!post) {
      console.log('🔄 Post not in cache, fetching from API...');
      post = await getPostById(postId);
    }

    if (!post) {
      console.error('❌ Post not found:', postId);
      return null;
    }

    console.log('✅ All notification data found');
    return { triggerUser, recipientUser, post };

  } catch (error) {
    console.error('❌ Error ensuring notification data:', error);
    return null;
  }
};

export const createNotificationWithRetry = async (
  createNotificationFn: (data: any) => void,
  notificationData: any,
  maxRetries = 2
) => {
  let attempts = 0;
  
  while (attempts <= maxRetries) {
    try {
      console.log(`🔔 Creating notification (attempt ${attempts + 1}/${maxRetries + 1})`);
      createNotificationFn(notificationData);
      console.log('✅ Notification created successfully');
      return;
    } catch (error) {
      console.error(`❌ Notification creation failed (attempt ${attempts + 1}):`, error);
      attempts++;
      
      if (attempts <= maxRetries) {
        console.log(`⏳ Retrying in 500ms...`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  
  console.error('❌ Notification creation failed after all retries');
};