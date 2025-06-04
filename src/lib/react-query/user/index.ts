import {
  checkIfUserIsAdmin,
  getUserById,
  getUsers,
  getUsersByRole,
  getUsersWithLastSeen,
  updateUser,
  updateUserLastSeen,
  updateUserRole
} from "@/lib/appwrite/auth/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { IUpdateUser } from "@/types";
import { QUERY_KEYS } from "../queryKeys";

export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: () => getUsers(limit),
  });
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

// NOVO: Hook para buscar usuários por role
export const useGetUsersByRole = (role: 'admin' | 'user') => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS_BY_ROLE, role],
    queryFn: () => getUsersByRole(role),
  });
};

// NOVO: Hook para verificar se usuário é admin
export const useCheckIfUserIsAdmin = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CHECK_IF_USER_IS_ADMIN, userId],
    queryFn: () => checkIfUserIsAdmin(userId),
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: IUpdateUser) => updateUser(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
      });
    },
  });
};

// NOVO: Hook para atualizar role do usuário (apenas para migração)
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'admin' | 'user' }) => 
      updateUserRole(userId, role),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USERS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USERS_BY_ROLE],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CHECK_IF_USER_IS_ADMIN, data?.$id],
      });
    },
  });
};

export const useGetUsersWithLastSeen = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS_WITH_LAST_SEEN],
    queryFn: getUsersWithLastSeen,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
    staleTime: 15000, // Considerar stale após 15 segundos
  });
};

export const useUpdateUserLastSeen = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => updateUserLastSeen(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USERS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USERS_WITH_LAST_SEEN],
      });
    },
  });
};