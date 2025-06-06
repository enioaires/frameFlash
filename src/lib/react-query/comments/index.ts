import { INewComment, IUpdateComment } from "@/types";
import {
  createComment,
  deleteComment,
  getCommentById,
  getCommentsByPostId,
  getCommentsCount,
  updateComment
} from "@/lib/appwrite/comments/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "../queryKeys";
import { buildNotificationMessage } from "@/lib/appwrite/notifications/api";
import { useCreateNotification } from "@/lib/react-query/notifications";
import { useGetUsers } from "@/lib/react-query/user";

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
  const { data: usersData } = useGetUsers(); // Para buscar nome do usuário

  return useMutation({
    mutationFn: (comment: INewComment) => createComment(comment),
    onSuccess: (data, variables) => {
      // Lógica existente de invalidação...
      queryClient.invalidateQueries({
        queryKey: [COMMENT_QUERY_KEYS.GET_COMMENTS_BY_POST, variables.postId],
      });
      
      queryClient.invalidateQueries({
        queryKey: [COMMENT_QUERY_KEYS.GET_COMMENTS_COUNT, variables.postId],
      });

      // 🆕 NOVA LÓGICA DE NOTIFICAÇÃO
      const { userId, postId, parentCommentId } = variables;
      
      // Buscar dados do usuário que comentou
      const triggerUser = usersData?.documents.find(u => u.$id === userId);
      
      if (triggerUser) {
        if (parentCommentId) {
          // É uma RESPOSTA - notificar autor do comentário original
          
          // Buscar comentário pai para obter o autor original
          const commentsData = queryClient.getQueryData([COMMENT_QUERY_KEYS.GET_COMMENTS_BY_POST, postId]) as any;
          const parentComment = commentsData?.documents?.find(
            (comment: any) => comment.$id === parentCommentId
          );
          
          const postData = queryClient.getQueryData([QUERY_KEYS.GET_POST_BY_ID, postId]) as any;
          
          if (parentComment && parentComment.userId !== userId && postData) {
            const message = buildNotificationMessage(
              'reply',
              triggerUser.name,
              postData?.title
            );

            createNotification({
              type: 'reply',
              recipientUserId: parentComment.userId,
              triggerUserId: userId,
              postId,
              commentId: data.$id,
              parentCommentId,
              message
            });
          }
            
        } else {
          // É um COMENTÁRIO - notificar criador do post
          
          // Buscar dados do post
          const postData = queryClient.getQueryData([QUERY_KEYS.GET_POST_BY_ID, postId]) as any;
          
          if (postData && postData?.creator?.$id !== userId) {
            const message = buildNotificationMessage(
              'comment',
              triggerUser.name,
              postData?.title
            );

            createNotification({
              type: 'comment',
              recipientUserId: postData.creator.$id,
              triggerUserId: userId,
              postId,
              commentId: data.$id,
              message
            });
          }
        }
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