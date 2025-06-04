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
  
  return useMutation({
    mutationFn: (comment: INewComment) => createComment(comment),
    onSuccess: (_data, variables) => {
      // Invalidar comentários do post
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