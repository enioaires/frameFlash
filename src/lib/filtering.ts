import { IUser } from '@/types';
import { Models } from 'appwrite';

// Função para normalizar texto (remove acentos, converte para minúsculo)
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Filtrar posts baseado nas aventuras do usuário
export const filterPostsByUserAdventures = (
  posts: Models.Document[],
  userAdventureIds: string[],
  isAdmin: boolean = false
): Models.Document[] => {
  if (!posts.length) return [];

  // Admins veem todos os posts
  if (isAdmin) return posts;

  // Usuários sem aventuras não veem posts
  if (userAdventureIds.length === 0) return [];

  return posts.filter(post => {
    if (!post.adventures || !Array.isArray(post.adventures)) return false;
    
    // Post é visível se o usuário participa de pelo menos uma aventura do post
    return post.adventures.some((adventureId: string) => 
      userAdventureIds.includes(adventureId)
    );
  });
};

// Filtrar aventuras baseado em permissões do usuário
export const filterAdventuresByPermissions = (
  adventures: Models.Document[],
  user: IUser
): Models.Document[] => {
  if (!adventures.length) return [];

  // Admins veem todas as aventuras
  if (user.role === 'admin') return adventures;

  // Usuários comuns só veem aventuras ativas
  return adventures.filter(adventure => adventure.status === 'active');
};

// Filtrar itens por termo de busca em múltiplos campos
export const filterBySearchTerm = (
  items: Models.Document[],
  searchTerm: string,
  searchFields: string[] = ['title', 'description']
): Models.Document[] => {
  if (!searchTerm.trim() || !items.length) return items;

  const normalizedSearch = normalizeText(searchTerm);

  return items.filter(item => 
    searchFields.some(field => {
      const fieldValue = item[field];
      if (!fieldValue || typeof fieldValue !== 'string') return false;
      return normalizeText(fieldValue).includes(normalizedSearch);
    })
  );
};

// Filtrar posts por tag específica
export const filterPostsByTag = (
  posts: Models.Document[],
  tagName: string
): Models.Document[] => {
  if (!tagName.trim() || !posts.length) return posts;

  const normalizedTag = normalizeText(tagName);

  return posts.filter(post => {
    if (!post.tags || !Array.isArray(post.tags)) return false;
    
    return post.tags.some((tag: string) => 
      normalizeText(tag).includes(normalizedTag)
    );
  });
};

// Filtrar por status (ativo/inativo)
export const filterByStatus = (
  items: Models.Document[],
  status: 'active' | 'inactive' | 'all'
): Models.Document[] => {
  if (status === 'all' || !items.length) return items;
  
  return items.filter(item => item.status === status);
};

// Ordenar aventuras (ativas primeiro, depois por data)
export const sortAdventures = (adventures: Models.Document[]): Models.Document[] => {
  return [...adventures].sort((a, b) => {
    // Primeiro por status (ativas primeiro)
    if (a.status !== b.status) {
      return a.status === 'active' ? -1 : 1;
    }
    
    // Depois por data de criação (mais recentes primeiro)
    return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
  });
};

// Ordenar posts por data (mais recentes primeiro)
export const sortPostsByDate = (posts: Models.Document[]): Models.Document[] => {
  return [...posts].sort((a, b) => 
    new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
  );
};

// Combinar múltiplos filtros
export const combineFilters = (
  items: Models.Document[],
  filters: {
    search?: string;
    searchFields?: string[];
    tag?: string;
    status?: 'active' | 'inactive' | 'all';
    userAdventureIds?: string[];
    isAdmin?: boolean;
    adventure?: string;
  }
): Models.Document[] => {
  let filtered = items;

  // Filtro por busca
  if (filters.search) {
    filtered = filterBySearchTerm(
      filtered, 
      filters.search, 
      filters.searchFields || ['title', 'description']
    );
  }

  // Filtro por tag
  if (filters.tag) {
    filtered = filterPostsByTag(filtered, filters.tag);
  }

  // Filtro por status
  if (filters.status) {
    filtered = filterByStatus(filtered, filters.status);
  }

  // Filtro por aventuras do usuário
  if (filters.userAdventureIds !== undefined && filters.isAdmin !== undefined) {
    filtered = filterPostsByUserAdventures(
      filtered, 
      filters.userAdventureIds, 
      filters.isAdmin
    );
  }

  // Filtro por aventura específica
  if (filters.adventure) {
    filtered = filtered.filter(item => 
      item.adventures && 
      Array.isArray(item.adventures) && 
      item.adventures.includes(filters.adventure!)
    );
  }

  return filtered;
};

// Obter estatísticas de filtragem
export const getFilteringStats = (
  originalItems: Models.Document[],
  filteredItems: Models.Document[]
) => {
  return {
    total: originalItems.length,
    visible: filteredItems.length,
    hidden: originalItems.length - filteredItems.length,
    percentage: originalItems.length > 0 
      ? Math.round((filteredItems.length / originalItems.length) * 100)
      : 0,
  };
};

// Verificar se usuário pode ver posts de aventuras específicas
export const canUserSeePostsFromAdventures = (
  postAdventures: string[],
  userAdventureIds: string[],
  isAdmin: boolean = false
): { canSee: boolean; reason: string } => {
  if (isAdmin) {
    return { canSee: true, reason: 'admin' };
  }

  if (userAdventureIds.length === 0) {
    return { canSee: false, reason: 'no_adventures' };
  }

  const hasMatchingAdventure = postAdventures.some(adventureId => 
    userAdventureIds.includes(adventureId)
  );

  return {
    canSee: hasMatchingAdventure,
    reason: hasMatchingAdventure ? 'participant' : 'not_participant'
  };
};

// Agrupar posts por aventura
export const groupPostsByAdventure = (
  posts: Models.Document[],
  adventures: Models.Document[]
): { [adventureId: string]: { adventure: Models.Document; posts: Models.Document[] } } => {
  const grouped: { [key: string]: { adventure: Models.Document; posts: Models.Document[] } } = {};

  // Inicializar grupos para cada aventura
  adventures.forEach(adventure => {
    grouped[adventure.$id] = {
      adventure,
      posts: []
    };
  });

  // Distribuir posts pelas aventuras
  posts.forEach(post => {
    if (post.adventures && Array.isArray(post.adventures)) {
      post.adventures.forEach((adventureId: string) => {
        if (grouped[adventureId]) {
          grouped[adventureId].posts.push(post);
        }
      });
    }
  });

  return grouped;
};

// Obter mensagem de estado vazio baseada no contexto
export const getEmptyStateMessage = (
  context: 'posts' | 'adventures' | 'search',
  hasAdventures: boolean,
  isAdmin: boolean,
  searchTerm?: string
) => {
  switch (context) {
    case 'posts':
      if (!hasAdventures && !isAdmin) {
        return {
          title: 'Você não está em nenhuma aventura',
          description: 'Entre em contato com um mestre para ser adicionado a uma aventura e começar a ver posts.',
          type: 'no_adventures'
        };
      }
      return {
        title: 'Nenhum post encontrado',
        description: 'Ainda não há posts para exibir.',
        type: 'no_posts'
      };

    case 'adventures':
      return {
        title: isAdmin ? 'Nenhuma aventura criada ainda' : 'Nenhuma aventura disponível',
        description: isAdmin 
          ? 'Comece criando sua primeira aventura.' 
          : 'Aguarde ser convidado para uma aventura.',
        type: 'no_adventures_available'
      };

    case 'search':
      return {
        title: 'Nenhum resultado encontrado',
        description: searchTerm 
          ? `Não encontramos resultados para "${searchTerm}".`
          : 'Nenhum item corresponde aos filtros aplicados.',
        type: 'no_results'
      };

    default:
      return {
        title: 'Nenhum conteúdo',
        description: 'Não há conteúdo para exibir.',
        type: 'empty'
      };
  }
};

// Validar se filtros estão ativos
export const hasActiveFilters = (filters: {
  search?: string;
  tag?: string;
  status?: string;
  adventure?: string;
}): boolean => {
  return Boolean(
    filters.search?.trim() ||
    filters.tag?.trim() ||
    (filters.status && filters.status !== 'all') ||
    filters.adventure?.trim()
  );
};