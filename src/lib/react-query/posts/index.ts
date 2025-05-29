/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

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
  getRecentPosts,
  getUserPosts,
  likePost,
  savePost,
  searchPosts,
  updatePost
} from "@/lib/appwrite/posts/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "../queryKeys";
import { getCurrentUser } from "@/lib/appwrite/auth/api";

// ATUALIZADO: invalidar novas queries relacionadas a aventuras
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
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
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, likesArray }: {
      postId: string;
      likesArray: string[]
    }) => likePost(postId, likesArray),
    onSuccess: (data) => {
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

// ATUALIZADO: invalidar queries relacionadas a aventuras
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data) => {
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
    },
  });
}

// ATUALIZADO: invalidar queries relacionadas a aventuras
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
    },
  });
}

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
  })
}

export const useGetPostsByTag = (tag: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POSTS_BY_TAG, tag],
    queryFn: () => getPostsByTag(tag),
    enabled: !!tag,
  })
}

// NOVO: Hook para posts filtrados por aventuras
export const useGetPostsByAdventures = (adventureIds: string[]) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POSTS_BY_ADVENTURES, adventureIds],
    queryFn: () => getPostsByAdventures(adventureIds),
    enabled: !!adventureIds && adventureIds.length > 0,
  });
};

// NOVO: Hook para posts filtrados para usuário
export const useGetFilteredPostsForUser = (userAdventureIds: string[], isAdmin: boolean = false) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_FILTERED_POSTS_FOR_USER, userAdventureIds, isAdmin],
    queryFn: () => getFilteredPostsForUser(userAdventureIds, isAdmin),
    enabled: isAdmin || (userAdventureIds && userAdventureIds.length > 0),
  });
};

// ATUALIZADO: Hook para posts por tag considerando aventuras do usuário
export const useGetPostsByTagForUser = (tag: string, userAdventureIds: string[], isAdmin: boolean = false) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POSTS_BY_TAG_FOR_USER, tag, userAdventureIds, isAdmin],
    queryFn: () => getPostsByTagForUser(tag, userAdventureIds, isAdmin),
    enabled: !!tag && (isAdmin || (userAdventureIds && userAdventureIds.length > 0)),
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
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS], // Certifique-se de que isso é um array
    queryFn: getInfinitePosts as any,
    getNextPageParam: (lastPage: any) => {
      // Se não há dados, não há mais páginas.
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