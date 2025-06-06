import { INewPost, IUpdatePost } from "@/types";
import {
  createPost,
  deletePost,
  deleteSavedPost,
  getFilteredPostsForUser,
  getInfinitePosts,
  getPostById,
  getPostsByAdventures,
  getPostsByTag,
  getPostsByTagForUser,
  getPublicPosts,
  getRecentPosts,
  getUserPosts,
  likePost,
  savePost,
  searchPosts,
  updatePost
} from "@/lib/appwrite/posts/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "../queryKeys";
import { buildNotificationMessage } from "@/lib/appwrite/notifications/api";
import { getCurrentUser } from "@/lib/appwrite/auth/api";
import { useCreateNotification } from "@/lib/react-query/notifications";
import { useGetUsers } from "@/lib/react-query/user";

// ==================== HOOKS DE POSTS EXISTENTES ====================

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS_BY_ADVENTURES],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FILTERED_POSTS_FOR_USER],
      });
      
      // 🆕 Se for post público, invalidar posts públicos
      if (!newPost?.adventures || newPost.adventures.length === 0) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_PUBLIC_POSTS],
        });
      }
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { mutate: createNotification } = useCreateNotification();
  const { data: usersData } = useGetUsers(); // Para buscar nome do usuário

  return useMutation({
    mutationFn: ({ postId, likesArray }: {
      postId: string;
      likesArray: string[];
    }) => likePost(postId, likesArray),
    onSuccess: (data, variables) => {
      // Lógica existente de invalidação...
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS_BY_ADVENTURES],
      });

      // 🆕 NOVA LÓGICA DE NOTIFICAÇÃO
      // Buscar dados do post do cache
      const postData = queryClient.getQueryData([QUERY_KEYS.GET_POST_BY_ID, variables.postId]) as any;
      
      if (postData && usersData?.documents) {
        // Determinar se foi like ou unlike comparando arrays
        const previousLikes = postData.likes?.map((like: any) => like.$id) || [];
        const newLikes = variables.likesArray;
        
        // Se o array novo é maior, foi um like
        const wasLiked = newLikes.length > previousLikes.length;
        
        if (wasLiked) {
          // Encontrar quem curtiu (usuário que está no novo array mas não no anterior)
          const likerUserId = newLikes.find(userId => !previousLikes.includes(userId));
          
          if (likerUserId && likerUserId !== postData.creator?.$id) {
            // Buscar dados do usuário que curtiu
            const triggerUser = usersData.documents.find(u => u.$id === likerUserId);
            
            if (triggerUser) {
              const message = buildNotificationMessage(
                'like',
                triggerUser.name,
                postData.title
              );

              createNotification({
                type: 'like',
                recipientUserId: postData.creator.$id,
                triggerUserId: likerUserId,
                postId: postData.$id,
                message
              });
            }
          }
        }
      }
    },
  });
}

export const useSavePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, userId }: {
      postId: string;
      userId: string
    }) => savePost(postId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
}

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS_BY_ADVENTURES],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FILTERED_POSTS_FOR_USER],
      });
      
      // 🆕 Verificar se post era/ficou público e invalidar adequadamente
      const wasPublic = !data?.adventures || data.adventures.length === 0;
      const isPublic = !variables.adventures || variables.adventures.length === 0;
      
      if (wasPublic || isPublic) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_PUBLIC_POSTS],
        });
      }
    },
  });
}

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, imageId }: {
      postId: string;
      imageId: string
    }) => deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS_BY_ADVENTURES],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FILTERED_POSTS_FOR_USER],
      });
      // 🆕 Invalidar posts públicos também
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_PUBLIC_POSTS],
      });
    },
  });
}

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
  })
}

// 🆕 NOVO: Hook para posts públicos
export const useGetPublicPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_PUBLIC_POSTS],
    queryFn: getPublicPosts,
    staleTime: 2 * 60 * 1000, // 2 minutos (posts públicos podem ser criados frequentemente)
    gcTime: 5 * 60 * 1000, // 5 minutos de cache
  });
};

export const useGetPostsByTag = (tag: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POSTS_BY_TAG, tag],
    queryFn: () => getPostsByTag(tag),
    enabled: !!tag,
  })
}

export const useGetPostsByAdventures = (adventureIds: string[]) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POSTS_BY_ADVENTURES, adventureIds],
    queryFn: () => getPostsByAdventures(adventureIds),
    enabled: !!adventureIds && adventureIds.length > 0,
  });
};

export const useGetFilteredPostsForUser = (
  userAdventureIds: string[], 
  publicAdventureIds: string[] = [], 
  isAdmin: boolean = false
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_FILTERED_POSTS_FOR_USER, userAdventureIds, publicAdventureIds, isAdmin],
    queryFn: () => getFilteredPostsForUser(userAdventureIds, publicAdventureIds, isAdmin),
    // 🆕 MODIFICADO: Sempre tentar buscar posts, mesmo sem aventuras (por causa dos públicos)
    enabled: true, // Sempre habilitado para buscar posts públicos
    staleTime: 1 * 60 * 1000, // 1 minuto para posts filtrados
    gcTime: 3 * 60 * 1000, // 3 minutos de cache
  });
};

// 🆕 HOOK MELHORADO: Posts por tag que considera acesso público
export const useGetPostsByTagForUser = (tag: string, userAdventureIds: string[], publicAdventureIds: string[] = [], isAdmin: boolean = false) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POSTS_BY_TAG_FOR_USER, tag, userAdventureIds, publicAdventureIds, isAdmin],
    queryFn: () => getPostsByTagForUser(tag, userAdventureIds, publicAdventureIds, isAdmin),
    // 🆕 MODIFICADO: Habilitado se há tag (posts públicos sempre acessíveis)
    enabled: !!tag,
    staleTime: 2 * 60 * 1000, // 2 minutos para tags
    gcTime: 5 * 60 * 1000, // 5 minutos de cache
  });
};

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: () => getCurrentUser(),
  })
}

export const useGetpostById = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  })
}

export const useGetPosts = () => {
  // @ts-ignore
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: getInfinitePosts as any,
    getNextPageParam: (lastPage: any) => {
      if (lastPage && lastPage.documents.length === 0) {
        return null;
      }
      const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
      return lastId;
    },
  });
};

export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm,
  })
}

export const useGetPostById = (postId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId!),
    enabled: !!postId,
  });
};

export const useGetUserPosts = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });
};