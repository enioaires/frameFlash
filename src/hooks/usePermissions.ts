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

    // Permissões de posts
    canCreatePost: () => {
      // Por enquanto mantém a verificação de IDs hardcoded
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

  return {
    canView: adventure?.status === 'active' || permissions.isAdmin,
    canEdit: permissions.canEditAdventure(adventure),
    canDelete: permissions.canDeleteAdventure(adventure),
    canManageParticipants: permissions.canManageParticipants(adventure),
    canToggleStatus: permissions.isAdmin,
  };
};

// Hook para verificar se usuário pode ver posts de determinadas aventuras
export const usePostVisibilityPermissions = (
  postAdventures: string[],
  userAdventures: string[]
) => {
  const permissions = usePermissions();

  return {
    canView: permissions.canSeeAllPosts ||
      postAdventures.some(adventureId => userAdventures.includes(adventureId)),
    reason: permissions.canSeeAllPosts
      ? 'admin'
      : postAdventures.some(adventureId => userAdventures.includes(adventureId))
        ? 'participant'
        : 'no_access'
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