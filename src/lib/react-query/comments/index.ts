import { INewComment, IUpdateComment } from "@/types";
import {
  createComment,
  deleteComment,
  getCommentById,
  getCommentsByPostId,
  getCommentsCount,
  updateComment
} from "@/lib/appwrite/comments/api";
import { createNotificationWithRetry, ensureNotificationData } from "@/lib/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { buildNotificationMessage } from "@/lib/appwrite/notifications/api";
import { useCreateNotification } from "@/lib/react-query/notifications";

// ==================== QUERY KEYS ====================

export enum COMMENT_QUERY_KEYS {
  GET_COMMENTS_BY_POST = "getCommentsByPost",
  GET_COMMENT_BY_ID = "getCommentById",
  GET_COMMENTS_COUNT = "getCommentsCount",
}

// ==================== QUERY HOOKS ====================

export const useGetCommentsByPostId = (postId: string) => {
  return useQuery({
    queryKey: [COMMENT_QUERY_KEYS.GET_COMMENTS_BY_POST, postId],
    queryFn: () => getCommentsByPostId(postId),
    enabled: !!postId,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useGetCommentById = (commentId: string) => {
  return useQuery({
    queryKey: [COMMENT_QUERY_KEYS.GET_COMMENT_BY_ID, commentId],
    queryFn: () => getCommentById(commentId),
    enabled: !!commentId,
  });
};

export const useGetCommentsCount = (postId: string) => {
  return useQuery({
    queryKey: [COMMENT_QUERY_KEYS.GET_COMMENTS_COUNT, postId],
    queryFn: () => getCommentsCount(postId),
    enabled: !!postId,
    staleTime: 30 * 1000, // 30 segundos
  });
};

// ==================== MUTATION HOOKS ====================

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { mutate: createNotification } = useCreateNotification();

  return useMutation({
    mutationFn: (comment: INewComment) => createComment(comment),
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [COMMENT_QUERY_KEYS.GET_COMMENTS_BY_POST, variables.postId],
      });

      queryClient.invalidateQueries({
        queryKey: [COMMENT_QUERY_KEYS.GET_COMMENTS_COUNT, variables.postId],
      });

      try {
        console.log('🔔 Processing comment notification...', variables);

        const { userId, postId, parentCommentId } = variables;

        const notificationData = await ensureNotificationData(
          queryClient,
          userId,
          'pending',
          postId
        );

        if (!notificationData) {
          console.error('❌ Failed to get notification data');
          return;
        }

        const { triggerUser, post } = notificationData;

        if (parentCommentId) {
          let parentComment = null;

          const commentsCache = queryClient.getQueryData([COMMENT_QUERY_KEYS.GET_COMMENTS_BY_POST, postId]) as any;
          parentComment = commentsCache?.documents?.find((c: any) => c.$id === parentCommentId);

          if (!parentComment) {
            console.log('🔄 Parent comment not in cache, fetching from API...');
            parentComment = await getCommentById(parentCommentId);
          }

          if (!parentComment) {
            console.error('❌ Parent comment not found:', parentCommentId);
            return;
          }

          if (parentComment.userId === userId) {
            console.log('⏭️ Skipping self-reply notification');
            return;
          }

          const message = buildNotificationMessage(
            'reply',
            triggerUser.name,
            post.title
          );

          const replyNotificationData = {
            type: 'reply',
            recipientUserId: parentComment.userId,
            triggerUserId: userId,
            postId,
            commentId: data.$id,
            message
          };

          console.log('📤 Creating reply notification:', replyNotificationData);
          await createNotificationWithRetry(createNotification, replyNotificationData);

        } else {
          if (post.creator.$id === userId) {
            console.log('⏭️ Skipping self-comment notification');
            return;
          }

          const message = buildNotificationMessage(
            'comment',
            triggerUser.name,
            post.title
          );

          const commentNotificationData = {
            type: 'comment',
            recipientUserId: post.creator.$id,
            triggerUserId: userId,
            postId,
            commentId: data.$id,
            message
          };

          console.log('📤 Creating comment notification:', commentNotificationData);
          await createNotificationWithRetry(createNotification, commentNotificationData);
        }

      } catch (error) {
        console.error('❌ Error in comment notification process:', error);
      }
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: IUpdateComment) => updateComment(comment),
    onSuccess: (data) => {
      // Invalidar comentário específico
      queryClient.invalidateQueries({
        queryKey: [COMMENT_QUERY_KEYS.GET_COMMENT_BY_ID, data.$id],
      });

      // Invalidar lista de comentários do post
      queryClient.invalidateQueries({
        queryKey: [COMMENT_QUERY_KEYS.GET_COMMENTS_BY_POST, data.postId],
      });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: { commentId: string; postId: string }) =>
      deleteComment(commentId),
    onSuccess: (_data, variables) => {
      // Invalidar lista de comentários do post
      queryClient.invalidateQueries({
        queryKey: [COMMENT_QUERY_KEYS.GET_COMMENTS_BY_POST, variables.postId],
      });

      // Invalidar contador de comentários
      queryClient.invalidateQueries({
        queryKey: [COMMENT_QUERY_KEYS.GET_COMMENTS_COUNT, variables.postId],
      });
    },
  });
};