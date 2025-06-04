import { useGetAdventuresForUser, useGetUserAdventures } from '@/lib/react-query/adventures';

import { Models } from 'appwrite';
import { isAdmin } from '@/lib/adventures';
import { useMemo } from 'react';
import { useUserContext } from '@/context/AuthContext';

// Hook principal para filtragem baseada em aventuras do usuário
export const useAdventureFiltering = () => {
  const { user } = useUserContext();
  const userIsAdmin = isAdmin(user);

  // Buscar aventuras do usuário (participações)
  const { data: userParticipations, isLoading: isLoadingParticipations } = useGetUserAdventures(user.id);
  
  // Buscar aventuras disponíveis (baseado em role)
  const { data: availableAdventures, isLoading: isLoadingAdventures } = useGetAdventuresForUser(
    user.id, 
    user.role
  );

  // IDs das aventuras onde o usuário participa
  const userAdventureIds = useMemo(() => {
    return userParticipations?.documents.map(p => p.adventureId) || [];
  }, [userParticipations]);

  // Aventuras ativas do usuário
  const activeUserAdventures = useMemo(() => {
    if (!availableAdventures?.documents) return [];
    
    return availableAdventures.documents.filter(adventure => {
      if (userIsAdmin) return true; // Admin vê todas
      return adventure.status === 'active' && userAdventureIds.includes(adventure.$id);
    });
  }, [availableAdventures, userIsAdmin, userAdventureIds]);

  // 🆕 NOVO: Aventuras públicas disponíveis
  const publicAdventures = useMemo(() => {
    if (!availableAdventures?.documents) return [];
    return availableAdventures.documents.filter(adventure => 
      adventure.isPublic === true && adventure.status === 'active'
    );
  }, [availableAdventures]);

  // 🆕 MODIFICADO: Incluir aventuras públicas automaticamente
  const allAccessibleAdventureIds = useMemo(() => {
    const privateAdventureIds = userAdventureIds;
    const publicAdventureIds = publicAdventures.map(a => a.$id);
    return [...new Set([...privateAdventureIds, ...publicAdventureIds])];
  }, [userAdventureIds, publicAdventures]);

  return {
    userAdventureIds,
    availableAdventures: availableAdventures?.documents || [],
    activeUserAdventures,
    publicAdventures, // 🆕 NOVO
    allAccessibleAdventureIds, // 🆕 NOVO
    isLoadingParticipations,
    isLoadingAdventures,
    isLoading: isLoadingParticipations || isLoadingAdventures,
    hasAdventures: allAccessibleAdventureIds.length > 0 || userIsAdmin, // 🆕 MODIFICADO
    isAdmin: userIsAdmin,
  };
};

// 🆕 CORRIGIDO: Lógica de filtragem de posts para incluir posts públicos
export const usePostFiltering = (posts: Models.Document[] = []) => {
  const { 
    userAdventureIds, 
    publicAdventures,
    isAdmin: userIsAdmin 
  } = useAdventureFiltering();

  const filteredPosts = useMemo(() => {
    if (!posts.length) return [];

    // Admin vê todos os posts
    if (userIsAdmin) return posts;

    return posts.filter(post => {
      // 🆕 PRIORIDADE 1: Posts públicos (sem aventuras) - TODOS podem ver
      if (!post.adventures || !Array.isArray(post.adventures) || post.adventures.length === 0) {
        return true;
      }
      
      // 🆕 PRIORIDADE 2: Posts em aventuras públicas - TODOS podem ver
      const publicAdventureIds = publicAdventures.map(a => a.$id);
      const hasPublicAdventures = post.adventures.some((adventureId: string) => 
        publicAdventureIds.includes(adventureId)
      );
      
      if (hasPublicAdventures) {
        return true;
      }
      
      // 🆕 PRIORIDADE 3: Posts em aventuras privadas onde o usuário participa
      const hasUserAdventures = post.adventures.some((adventureId: string) => 
        userAdventureIds.includes(adventureId)
      );
      
      return hasUserAdventures;
    });
  }, [posts, userAdventureIds, publicAdventures, userIsAdmin]);

  // 🆕 NOVO: Estatísticas detalhadas
  const stats = useMemo(() => {
    const totalPosts = posts.length;
    const visiblePosts = filteredPosts.length;
    const hiddenPosts = totalPosts - visiblePosts;
    
    const publicPosts = posts.filter(post => 
      !post.adventures || !Array.isArray(post.adventures) || post.adventures.length === 0
    ).length;
    
    const publicAdventureIds = publicAdventures.map(a => a.$id);
    const publicAdventurePosts = posts.filter(post => 
      post.adventures && Array.isArray(post.adventures) && 
      post.adventures.some((id: string) => publicAdventureIds.includes(id))
    ).length;
    
    const privatePosts = posts.filter(post => 
      post.adventures && Array.isArray(post.adventures) && post.adventures.length > 0 &&
      !post.adventures.some((id: string) => publicAdventureIds.includes(id))
    ).length;

    return {
      totalPosts,
      visiblePosts,
      hiddenPosts,
      publicPosts,
      publicAdventurePosts,
      privatePosts,
    };
  }, [posts, filteredPosts, publicAdventures]);

  return {
    filteredPosts,
    totalPosts: posts.length,
    visiblePosts: filteredPosts.length,
    hiddenPosts: posts.length - filteredPosts.length,
    canSeeAll: userIsAdmin,
    stats, // 🆕 NOVO
  };
};

// Hook para filtrar aventuras baseado em permissões
export const useAdventuresFiltering = () => {
  const { user } = useUserContext();
  const userIsAdmin = isAdmin(user);

  const filterAdventures = useMemo(() => {
    return (adventures: Models.Document[]) => {
      if (!adventures.length) return [];

      // Admin vê todas as aventuras
      if (userIsAdmin) return adventures;

      // Usuário comum só vê aventuras ativas
      return adventures.filter(adventure => adventure.status === 'active');
    };
  }, [userIsAdmin]);

  const sortAdventures = useMemo(() => {
    return (adventures: Models.Document[]) => {
      return [...adventures].sort((a, b) => {
        // Primeiro por status (ativas primeiro)
        if (a.status !== b.status) {
          return a.status === 'active' ? -1 : 1;
        }
        
        // Depois por data de criação (mais recentes primeiro)
        return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
      });
    };
  }, []);

  return {
    filterAdventures,
    sortAdventures,
    isAdmin: userIsAdmin,
  };
};

// 🆕 CORRIGIDO: Estados de filtragem melhorados
export const useFilteringStates = () => {
  const { 
    hasAdventures, 
    isAdmin: userIsAdmin, 
    isLoading,
    publicAdventures,
    allAccessibleAdventureIds 
  } = useAdventureFiltering();

  const getEmptyState = (context: 'posts' | 'adventures' | 'filtered') => {
    if (isLoading) {
      return {
        type: 'loading',
        title: 'Carregando...',
        description: 'Carregando conteúdo...',
        showLoader: true,
      };
    }

    // 🆕 CORRIGIDO: Usuários podem ver conteúdo mesmo sem aventuras privadas
    // se houver aventuras públicas ou posts públicos
    const hasAccessToContent = userIsAdmin || 
                              allAccessibleAdventureIds.length > 0 || 
                              publicAdventures.length > 0;

    if (!hasAccessToContent) {
      return {
        type: 'no_adventures',
        title: 'Você não está em nenhuma aventura',
        description: 'Entre em contato com um mestre para ser adicionado a uma aventura. Você ainda pode ver posts públicos se houver.',
        showContactInfo: true,
        icon: '🏰',
      };
    }

    switch (context) {
      case 'posts':
        return {
          type: 'no_posts',
          title: 'Nenhum post encontrado',
          description: hasAdventures 
            ? 'Ainda não há posts nas suas aventuras.' 
            : 'Ainda não há posts públicos disponíveis.',
          icon: '📝',
        };

      case 'adventures':
        return {
          type: 'no_adventures_available',
          title: userIsAdmin ? 'Nenhuma aventura criada' : 'Nenhuma aventura disponível',
          description: userIsAdmin 
            ? 'Comece criando sua primeira aventura.' 
            : 'Procure por aventuras públicas ou aguarde ser convidado.',
          icon: '🎭',
        };

      case 'filtered':
        return {
          type: 'no_results',
          title: 'Nenhum resultado encontrado',
          description: 'Tente ajustar os filtros de busca.',
          icon: '🔍',
        };

      default:
        return {
          type: 'empty',
          title: 'Nenhum conteúdo',
          description: 'Não há conteúdo para exibir.',
          icon: '📭',
        };
    }
  };

  return {
    getEmptyState,
    hasAdventures,
    hasAccessToContent: userIsAdmin || allAccessibleAdventureIds.length > 0 || publicAdventures.length > 0, // 🆕 NOVO
    isAdmin: userIsAdmin,
    isLoading,
    publicAdventuresCount: publicAdventures.length, // 🆕 NOVO
  };
};

// Hook para filtros avançados (busca, tags, etc.)
export const useAdvancedFiltering = (
  items: Models.Document[] = [],
  options: {
    searchFields?: string[];
    enableTagFilter?: boolean;
    enableStatusFilter?: boolean;
  } = {}
) => {
  const { searchFields = ['title', 'description'], enableTagFilter = false, enableStatusFilter = false } = options;

  const filterBySearch = useMemo(() => {
    return (searchTerm: string) => {
      if (!searchTerm.trim()) return items;

      const normalizeText = (text: string) => 
        text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      const normalizedSearch = normalizeText(searchTerm);

      return items.filter(item => 
        searchFields.some(field => {
          const fieldValue = item[field];
          if (!fieldValue) return false;
          return normalizeText(fieldValue).includes(normalizedSearch);
        })
      );
    };
  }, [items, searchFields]);

  const filterByTag = useMemo(() => {
    return (selectedTag: string) => {
      if (!selectedTag || !enableTagFilter) return items;

      return items.filter(item => 
        item.tags && Array.isArray(item.tags) && 
        item.tags.some((tag: string) => 
          tag.toLowerCase().includes(selectedTag.toLowerCase())
        )
      );
    };
  }, [items, enableTagFilter]);

  const filterByStatus = useMemo(() => {
    return (status: 'active' | 'inactive' | 'all') => {
      if (!enableStatusFilter || status === 'all') return items;

      return items.filter(item => item.status === status);
    };
  }, [items, enableStatusFilter]);

  const combineFilters = useMemo(() => {
    return (filters: {
      search?: string;
      tag?: string;
      status?: 'active' | 'inactive' | 'all';
      adventure?: string;
    }) => {
      let filtered = items;

      // Aplicar filtro de busca
      if (filters.search) {
        filtered = filterBySearch(filters.search);
      }

      // Aplicar filtro de tag
      if (filters.tag && enableTagFilter) {
        filtered = filtered.filter(item => 
          item.tags && Array.isArray(item.tags) && 
          item.tags.some((tag: string) => 
            tag.toLowerCase().includes(filters.tag!.toLowerCase())
          )
        );
      }

      // Aplicar filtro de status
      if (filters.status && enableStatusFilter && filters.status !== 'all') {
        filtered = filtered.filter(item => item.status === filters.status);
      }

      // Aplicar filtro de aventura
      if (filters.adventure) {
        filtered = filtered.filter(item => 
          item.adventures && Array.isArray(item.adventures) && 
          item.adventures.includes(filters.adventure!)
        );
      }

      return filtered;
    };
  }, [items, filterBySearch, filterByTag, filterByStatus, enableTagFilter, enableStatusFilter]);

  return {
    filterBySearch,
    filterByTag,
    filterByStatus,
    combineFilters,
    totalItems: items.length,
  };
};