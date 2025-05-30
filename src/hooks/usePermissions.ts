import { isAdmin, isAdminById } from "@/lib/adventures";

import { Models } from "appwrite";
import { useUserContext } from "@/context/AuthContext";

// Hook principal para verificar se o usuário é admin
export const useIsAdmin = () => {
  const { user } = useUserContext();

  // Verificação dupla: por role e por ID (transição)
  return isAdmin(user) || isAdminById(user.id);
};

// Hook para verificar permissões específicas
export const usePermissions = () => {
  const { user } = useUserContext();
  const userIsAdmin = useIsAdmin();

  return {
    // Verificações básicas
    isAdmin: userIsAdmin,
    isUser: !userIsAdmin,
    userId: user.id,

    // Permissões de aventuras
    canCreateAdventure: userIsAdmin,
    canEditAdventure: (adventure?: Models.Document) => {
      if (!adventure) return userIsAdmin;
      return userIsAdmin; // Só admins podem editar qualquer aventura
    },
    canDeleteAdventure: (adventure?: Models.Document) => {
      if (!adventure) return userIsAdmin;
      return userIsAdmin; // Só admins podem deletar aventuras
    },
    canManageParticipants: (adventure?: Models.Document) => {
      if (!adventure) return userIsAdmin;
      return userIsAdmin; // Só admins podem gerenciar participantes
    },
    canToggleAdventureVisibility: (adventure?: Models.Document) => {
      if (!adventure) return userIsAdmin;
      return userIsAdmin; // Só admins podem tornar aventuras públicas/privadas
    },

    // Permissões de posts
    canCreatePost: () => {
      // Verificação temporária por IDs hardcoded
      const allowedIds = [
        "2f9599f6-f734-4ba4-b351-90a5958a90cf",
        "9977be99-cc64-48df-bb5a-42daba635447",
        "09f99d93-9cdc-4dcd-b698-da1574506f6f",
        "b6b5df9c-9d09-4614-9920-684cc0effb7a"
      ];
      return allowedIds.includes(user.id);
    },
    canCreatePublicPost: () => {
      // Por enquanto, mesma verificação que posts normais
      const allowedIds = [
        "2f9599f6-f734-4ba4-b351-90a5958a90cf",
        "9977be99-cc64-48df-bb5a-42daba635447",
        "09f99d93-9cdc-4dcd-b698-da1574506f6f",
        "b6b5df9c-9d09-4614-9920-684cc0effb7a"
      ];
      return allowedIds.includes(user.id);
    },
    canEditPost: (post?: Models.Document) => {
      if (!post) return false;
      return post.creator?.$id === user.id || userIsAdmin;
    },
    canDeletePost: (post?: Models.Document) => {
      if (!post) return false;
      return post.creator?.$id === user.id || userIsAdmin;
    },

    // Permissões de visualização de posts
    canViewPost: (
      post: Models.Document, 
      userAdventures: string[], 
      publicAdventures: string[] = []
    ) => {
      // Admin vê todos os posts
      if (userIsAdmin) return true;

      // Post público (sem aventuras)
      if (!post.adventures || post.adventures.length === 0) return true;

      // Post em aventuras públicas
      if (post.adventures.some((id: string) => publicAdventures.includes(id))) return true;

      // Post em aventuras onde é participante
      return post.adventures.some((id: string) => userAdventures.includes(id));
    },

    // Permissões de aventuras
    canViewAdventure: (adventure: Models.Document, userAdventures: string[]) => {
      // Admin vê todas
      if (userIsAdmin) return true;

      // Aventura pública e ativa
      if (adventure.isPublic && adventure.status === 'active') return true;

      // Aventura onde é participante
      return userAdventures.includes(adventure.$id);
    },

    // Permissões de usuários
    canViewAllUsers: userIsAdmin,
    canEditUserRole: userIsAdmin,
    canViewUserDetails: (targetUserId: string) => {
      return userIsAdmin || targetUserId === user.id;
    },

    // Permissões de visualização
    canSeeInactiveAdventures: userIsAdmin,
    canAccessAdminFeatures: userIsAdmin,
    canViewSystemStats: userIsAdmin,

    // Permissões de filtragem
    canSeeAllPosts: userIsAdmin,
    canBypassAdventureFilters: userIsAdmin,
    canSeePrivateAdventures: userIsAdmin,

    // Novas permissões para posts públicos
    canFilterByVisibility: () => true, // Todos podem filtrar
    canSeePostsWithoutAdventures: () => true, // Posts públicos são para todos
  };
};

// Hook para verificar se usuário pode acessar uma rota específica
export const useCanAccessRoute = (routePath: string) => {
  const permissions = usePermissions();

  const adminOnlyRoutes = [
    '/adventures',
    '/adventures/create',
    '/adventures/*/edit',
    '/adventures/*/manage',
  ];

  const isAdminRoute = adminOnlyRoutes.some(route => {
    // Converter padrões como '/adventures/*/edit' para regex
    const regexPattern = route.replace(/\*/g, '[^/]+');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(routePath);
  });

  if (isAdminRoute) {
    return permissions.isAdmin;
  }

  // Outras verificações específicas podem ser adicionadas aqui
  return true;
};

// Hook para verificar permissões de aventura específica
export const useAdventurePermissions = (adventure?: Models.Document) => {
  const permissions = usePermissions();

  if (!adventure) {
    return {
      canView: false,
      canEdit: false,
      canDelete: false,
      canManageParticipants: false,
      canToggleStatus: false,
      canToggleVisibility: false,
    };
  }

  return {
    canView: permissions.canViewAdventure(adventure, []), // Será passado o array correto no componente
    canEdit: permissions.canEditAdventure(adventure),
    canDelete: permissions.canDeleteAdventure(adventure),
    canManageParticipants: permissions.canManageParticipants(adventure),
    canToggleStatus: permissions.isAdmin,
    canToggleVisibility: permissions.canToggleAdventureVisibility(adventure),
  };
};

// Hook para verificar se usuário pode ver posts de determinadas aventuras
export const usePostVisibilityPermissions = (
  postAdventures: string[],
  userAdventures: string[],
  publicAdventures: string[] = []
) => {
  const permissions = usePermissions();

  // Post público (sem aventuras)
  if (!postAdventures || postAdventures.length === 0) {
    return {
      canView: true,
      reason: 'public_post',
      description: 'Post público - visível para todos'
    };
  }

  // Admin vê todos
  if (permissions.canSeeAllPosts) {
    return {
      canView: true,
      reason: 'admin',
      description: 'Administrador - vê todos os posts'
    };
  }

  // Verificar aventuras públicas
  const hasPublicAdventures = postAdventures.some(id => publicAdventures.includes(id));
  if (hasPublicAdventures) {
    return {
      canView: true,
      reason: 'public_adventure',
      description: 'Post em aventura pública'
    };
  }

  // Verificar participação
  const hasUserAdventures = postAdventures.some(id => userAdventures.includes(id));
  if (hasUserAdventures) {
    return {
      canView: true,
      reason: 'participant',
      description: 'Participante da aventura'
    };
  }

  return {
    canView: false,
    reason: 'no_access',
    description: 'Sem acesso às aventuras deste post'
  };
};

// Hook para obter permissões de upload/mídia
export const useMediaPermissions = () => {
  const permissions = usePermissions();

  return {
    canUploadImages: permissions.canCreatePost(),
    maxFileSize: permissions.isAdmin ? 10 * 1024 * 1024 : 5 * 1024 * 1024, // 10MB admin, 5MB user
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    canUploadMultiple: permissions.isAdmin,
  };
};

// Hook para verificar permissões de filtros
export const useFilterPermissions = () => {
  const permissions = usePermissions();

  return {
    canFilterByAdventure: () => true, // Todos podem filtrar por aventura
    canFilterByVisibility: () => true, // Todos podem filtrar por visibilidade
    canFilterByStatus: permissions.isAdmin, // Só admins filtram por status
    canSeeFilterStats: permissions.isAdmin, // Só admins veem estatísticas
    canSeeHiddenContent: permissions.isAdmin, // Só admins sabem sobre conteúdo oculto
  };
};

// Hook para verificar permissões de criação de conteúdo
export const useContentCreationPermissions = () => {
  const permissions = usePermissions();

  return {
    canCreateAdventure: permissions.canCreateAdventure,
    canCreatePost: permissions.canCreatePost(),
    canCreatePublicPost: permissions.canCreatePublicPost(),
    canMakeAdventurePublic: permissions.isAdmin,
    canMakeAdventurePrivate: permissions.isAdmin,
    maxAdventures: permissions.isAdmin ? Infinity : 0, // Só admins criam aventuras
    maxPostsPerDay: permissions.isAdmin ? Infinity : 10, // Limite para usuários
  };
};

// Hook para verificar permissões contextuais baseadas em estado
export const useContextualPermissions = (
  hasAdventures: boolean,
  publicAdventuresCount: number = 0
) => {
  const permissions = usePermissions();

  return {
    // Pode ver conteúdo da plataforma
    canAccessContent: permissions.isAdmin || hasAdventures || publicAdventuresCount > 0,
    
    // Pode interagir com posts
    canInteractWithPosts: permissions.isAdmin || hasAdventures || publicAdventuresCount > 0,
    
    // Precisa de convite para aventuras
    needsAdventureInvite: !permissions.isAdmin && !hasAdventures && publicAdventuresCount === 0,
    
    // Motivo de acesso
    accessReason: permissions.isAdmin 
      ? 'admin' 
      : hasAdventures 
        ? 'participant' 
        : publicAdventuresCount > 0 
          ? 'public_adventures' 
          : 'no_access',
          
    // Mensagem de acesso
    accessMessage: permissions.isAdmin
      ? 'Acesso total como administrador'
      : hasAdventures
        ? `Acesso através de ${hasAdventures ? 'aventuras privadas' : 'aventuras'}`
        : publicAdventuresCount > 0
          ? `Acesso através de ${publicAdventuresCount} aventura(s) pública(s)`
          : 'Aguardando convite para aventuras'
  };
};