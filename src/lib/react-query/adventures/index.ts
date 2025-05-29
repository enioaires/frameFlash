import { INewAdventure, INewAdventureParticipant, IUpdateAdventure } from "@/types";
import {
  addParticipant,
  createAdventure,
  deleteAdventure,
  getActiveAdventures,
  getAdventureById,
  getAdventureParticipants,
  getAdventures,
  getAdventuresForUser,
  getUserAdventures,
  isUserParticipantInAdventure,
  removeParticipant,
  updateAdventure
} from "@/lib/appwrite/adventures/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "../queryKeys";

// ==================== ADVENTURE HOOKS ====================

export const useGetAdventures = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ADVENTURES],
    queryFn: getAdventures,
  });
};

export const useGetActiveAdventures = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ACTIVE_ADVENTURES],
    queryFn: getActiveAdventures,
  });
};

export const useGetAdventureById = (adventureId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ADVENTURE_BY_ID, adventureId],
    queryFn: () => getAdventureById(adventureId),
    enabled: !!adventureId,
  });
};

export const useGetAdventuresForUser = (userId: string, userRole: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ADVENTURES_FOR_USER, userId, userRole],
    queryFn: () => getAdventuresForUser(userId, userRole),
    enabled: !!userId && !!userRole,
  });
};

export const useCreateAdventure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (adventure: INewAdventure) => createAdventure(adventure),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADVENTURES],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ACTIVE_ADVENTURES],
      });
    },
  });
};

export const useUpdateAdventure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (adventure: IUpdateAdventure) => updateAdventure(adventure),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADVENTURES],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ACTIVE_ADVENTURES],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADVENTURE_BY_ID, data?.$id],
      });
    },
  });
};

export const useDeleteAdventure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ adventureId, imageId }: { adventureId: string; imageId: string }) =>
      deleteAdventure(adventureId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADVENTURES],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ACTIVE_ADVENTURES],
      });
    },
  });
};

// ==================== PARTICIPANT HOOKS ====================

export const useGetAdventureParticipants = (adventureId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ADVENTURE_PARTICIPANTS, adventureId],
    queryFn: () => getAdventureParticipants(adventureId),
    enabled: !!adventureId,
  });
};

export const useGetUserAdventures = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_ADVENTURES, userId],
    queryFn: () => getUserAdventures(userId),
    enabled: !!userId,
  });
};

export const useIsUserParticipant = (userId: string, adventureId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.IS_USER_PARTICIPANT, userId, adventureId],
    queryFn: () => isUserParticipantInAdventure(userId, adventureId),
    enabled: !!userId && !!adventureId,
  });
};

export const useAddParticipant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (participant: INewAdventureParticipant) => addParticipant(participant),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADVENTURE_PARTICIPANTS, variables.adventureId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_ADVENTURES, variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.IS_USER_PARTICIPANT, variables.userId, variables.adventureId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADVENTURES_FOR_USER],
      });
    },
  });
};

export const useRemoveParticipant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ adventureId, userId }: { adventureId: string; userId: string }) =>
      removeParticipant(adventureId, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADVENTURE_PARTICIPANTS, variables.adventureId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_ADVENTURES, variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.IS_USER_PARTICIPANT, variables.userId, variables.adventureId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADVENTURES_FOR_USER],
      });
      // Invalidar posts também pois usuário pode não ver mais alguns posts
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS_BY_ADVENTURES],
      });
    },
  });
};

// ==================== BATCH OPERATIONS ====================

export const useAddMultipleParticipants = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ adventureId, userIds, addedBy }: {
      adventureId: string;
      userIds: string[];
      addedBy: string;
    }) => {
      const results = [];
      
      for (const userId of userIds) {
        try {
          const result = await addParticipant({
            adventureId,
            userId,
            addedBy
          });
          results.push({ userId, success: true, data: result });
        } catch (error) {
          results.push({ userId, success: false, error });
        }
      }
      
      return results;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADVENTURE_PARTICIPANTS, variables.adventureId],
      });
      
      // Invalidar para cada usuário adicionado com sucesso
      data.forEach(result => {
        if (result.success) {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.GET_USER_ADVENTURES, result.userId],
          });
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.IS_USER_PARTICIPANT, result.userId, variables.adventureId],
          });
        }
      });
      
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADVENTURES_FOR_USER],
      });
    },
  });
};