import { INewBanner, IUpdateBanner } from "@/types";
import {
  createBanner,
  deleteBanner,
  getAllTagBanners,
  getBannerById,
  getBannerByTypeAndIdentifier,
  getBanners,
  getHomeBanner,
  getTagBanner,
  updateBanner
} from "@/lib/appwrite/banners/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ==================== QUERY KEYS ====================

export enum BANNER_QUERY_KEYS {
  GET_BANNERS = "getBanners",
  GET_BANNER_BY_ID = "getBannerById",
  GET_BANNER_BY_TYPE_IDENTIFIER = "getBannerByTypeAndIdentifier",
  GET_HOME_BANNER = "getHomeBanner",
  GET_TAG_BANNER = "getTagBanner",
  GET_ALL_TAG_BANNERS = "getAllTagBanners",
}

// ==================== QUERY HOOKS ====================

export const useGetBanners = () => {
  return useQuery({
    queryKey: [BANNER_QUERY_KEYS.GET_BANNERS],
    queryFn: getBanners,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useGetBannerById = (bannerId: string) => {
  return useQuery({
    queryKey: [BANNER_QUERY_KEYS.GET_BANNER_BY_ID, bannerId],
    queryFn: () => getBannerById(bannerId),
    enabled: !!bannerId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetBannerByTypeAndIdentifier = (type: 'home' | 'tag', identifier: string) => {
  return useQuery({
    queryKey: [BANNER_QUERY_KEYS.GET_BANNER_BY_TYPE_IDENTIFIER, type, identifier],
    queryFn: () => getBannerByTypeAndIdentifier(type, identifier),
    enabled: !!type && !!identifier,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetHomeBanner = () => {
  return useQuery({
    queryKey: [BANNER_QUERY_KEYS.GET_HOME_BANNER],
    queryFn: getHomeBanner,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetTagBanner = (tagIdentifier: string) => {
  return useQuery({
    queryKey: [BANNER_QUERY_KEYS.GET_TAG_BANNER, tagIdentifier],
    queryFn: () => getTagBanner(tagIdentifier),
    enabled: !!tagIdentifier,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetAllTagBanners = () => {
  return useQuery({
    queryKey: [BANNER_QUERY_KEYS.GET_ALL_TAG_BANNERS],
    queryFn: getAllTagBanners,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// ==================== MUTATION HOOKS ====================

export const useCreateBanner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (banner: INewBanner) => createBanner(banner),
    onSuccess: (newBanner) => {
      // Invalidate all banner queries
      queryClient.invalidateQueries({
        queryKey: [BANNER_QUERY_KEYS.GET_BANNERS],
      });
      
      // Invalidate specific type/identifier query
      queryClient.invalidateQueries({
        queryKey: [BANNER_QUERY_KEYS.GET_BANNER_BY_TYPE_IDENTIFIER, newBanner.type, newBanner.identifier],
      });
      
      // Invalidate home or tag specific queries
      if (newBanner.type === 'home') {
        queryClient.invalidateQueries({
          queryKey: [BANNER_QUERY_KEYS.GET_HOME_BANNER],
        });
      } else if (newBanner.type === 'tag') {
        queryClient.invalidateQueries({
          queryKey: [BANNER_QUERY_KEYS.GET_TAG_BANNER, newBanner.identifier],
        });
        queryClient.invalidateQueries({
          queryKey: [BANNER_QUERY_KEYS.GET_ALL_TAG_BANNERS],
        });
      }
    },
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (banner: IUpdateBanner) => updateBanner(banner),
    onSuccess: (updatedBanner, variables) => {
      // Invalidate all banner queries
      queryClient.invalidateQueries({
        queryKey: [BANNER_QUERY_KEYS.GET_BANNERS],
      });
      
      // Invalidate specific banner query
      queryClient.invalidateQueries({
        queryKey: [BANNER_QUERY_KEYS.GET_BANNER_BY_ID, updatedBanner.$id],
      });
      
      // Invalidate specific type/identifier query
      queryClient.invalidateQueries({
        queryKey: [BANNER_QUERY_KEYS.GET_BANNER_BY_TYPE_IDENTIFIER, variables.type, variables.identifier],
      });
      
      // Invalidate home or tag specific queries
      if (variables.type === 'home') {
        queryClient.invalidateQueries({
          queryKey: [BANNER_QUERY_KEYS.GET_HOME_BANNER],
        });
      } else if (variables.type === 'tag') {
        queryClient.invalidateQueries({
          queryKey: [BANNER_QUERY_KEYS.GET_TAG_BANNER, variables.identifier],
        });
        queryClient.invalidateQueries({
          queryKey: [BANNER_QUERY_KEYS.GET_ALL_TAG_BANNERS],
        });
      }
    },
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bannerId, imageId }: { bannerId: string; imageId: string }) =>
      deleteBanner(bannerId, imageId),
    onSuccess: () => {
      // Invalidate all banner queries
      queryClient.invalidateQueries({
        queryKey: [BANNER_QUERY_KEYS.GET_BANNERS],
      });
      queryClient.invalidateQueries({
        queryKey: [BANNER_QUERY_KEYS.GET_HOME_BANNER],
      });
      queryClient.invalidateQueries({
        queryKey: [BANNER_QUERY_KEYS.GET_ALL_TAG_BANNERS],
      });
      // Note: We can't invalidate specific queries without knowing which banner was deleted
      // But since deletion is rare, invalidating all is acceptable
    },
  });
};