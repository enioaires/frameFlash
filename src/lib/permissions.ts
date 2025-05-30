import { IUser } from "@/types";
import { Models } from "appwrite";

// Constantes de permissões
export const PERMISSIONS = {
  // Aventuras
  CREATE_ADVENTURE: 'create_adventure',
  EDIT_ADVENTURE: 'edit_adventure',
  DELETE_ADVENTURE: 'delete_adventure',
  MANAGE_PARTICIPANTS: 'manage_participants',
  VIEW_INACTIVE_ADVENTURES: 'view_inactive_adventures',
  TOGGLE_ADVENTURE_VISIBILITY: 'toggle_adventure_visibility',

  // Posts
  CREATE_POST: 'create_post',
  CREATE_PUBLIC_POST: 'create_public_post',
  EDIT_ANY_POST: 'edit_any_post',
  DELETE_ANY_POST: 'delete_any_post',
  VIEW_ALL_POSTS: 'view_all_posts',

  // Usuários
  VIEW_ALL_USERS: 'view_all_users',
  EDIT_USER_ROLES: 'edit_user_roles',
  ACCESS_ADMIN_PANEL: 'access_admin_panel',

  // Sistema
  VIEW_SYSTEM_STATS: 'view_system_stats',
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
  BYPASS_FILTERS: 'bypass_filters',
} as const;

// Tipo para as chaves de permissões
type PermissionKey = keyof typeof PERMISSIONS;
type PermissionValue = (typeof PERMISSIONS)[PermissionKey];

// Mapeamento de roles para permissões
export const ROLE_PERMISSIONS: Record<'admin' | 'user', PermissionValue[]> = {
  admin: [
    PERMISSIONS.CREATE_ADVENTURE,
    PERMISSIONS.EDIT_ADVENTURE,
    PERMISSIONS.DELETE_ADVENTURE,
    PERMISSIONS.MANAGE_PARTICIPANTS,
    PERMISSIONS.VIEW_INACTIVE_ADVENTURES,
    PERMISSIONS.TOGGLE_ADVENTURE_VISIBILITY,
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.CREATE_PUBLIC_POST,
    PERMISSIONS.EDIT_ANY_POST,
    PERMISSIONS.DELETE_ANY_POST,
    PERMISSIONS.VIEW_ALL_POSTS,
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.EDIT_USER_ROLES,
    PERMISSIONS.ACCESS_ADMIN_PANEL,
    PERMISSIONS.VIEW_SYSTEM_STATS,
    PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
    PERMISSIONS.BYPASS_FILTERS,
  ],
  user: [
    PERMISSIONS.CREATE_POST, // Com restrições de IDs hardcoded
    PERMISSIONS.CREATE_PUBLIC_POST, // Com restrições de IDs hardcoded
  ],
};

// Função para verificar se usuário tem permissão específica
export const hasPermission = (
  user: IUser, 
  permission: PermissionKey
): boolean => {
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(PERMISSIONS[permission]);
};

// Função para verificar múltiplas permissões (precisa ter todas)
export const hasAllPermissions = (
  user: IUser, 
  permissions: PermissionKey[]
): boolean => {
  return permissions.every(permission => hasPermission(user, permission));
};

// Função para verificar múltiplas permissões (precisa ter pelo menos uma)
export const hasAnyPermission = (
  user: IUser, 
  permissions: PermissionKey[]
): boolean => {
  return permissions.some(permission => hasPermission(user, permission));
};

// Filtros baseados em permissões
export const filterAdventuresByPermissions = (
  adventures: Models.Document[],
  user: IUser,
  userAdventures: string[]
): Models.Document[] => {
  if (hasPermission(user, 'VIEW_INACTIVE_ADVENTURES')) {
    return adventures; // Admin vê todas
  }
  
  return adventures.filter(adventure => {
    // Usuários veem apenas aventuras ativas
    if (adventure.status !== 'active') return false;
    
    // Aventuras públicas são visíveis para todos
    if (adventure.isPublic) return true;
    
    // Aventuras privadas só para participantes
    return userAdventures.includes(adventure.$id);
  });
};

export const filterPostsByPermissions = (
  posts: Models.Document[],
  user: IUser,
  userAdventures: string[],
  publicAdventures: string[] = []
): Models.Document[] => {
  if (hasPermission(user, 'VIEW_ALL_POSTS')) {
    return posts; // Admin vê todos
  }

  return posts.filter(post => {
    // Posts públicos (sem aventuras) são visíveis para todos
    if (!post.adventures || post.adventures.length === 0) return true;
    
    // Posts em aventuras públicas são visíveis para todos
    if (post.adventures.some((id: string) => publicAdventures.includes(id))) return true;
    
    // Posts em aventuras onde é participante
    return post.adventures.some((id: string) => userAdventures.includes(id));
  });
};

export const filterUsersByPermissions = (
  users: Models.Document[],
  currentUser: IUser
): Models.Document[] => {
  if (hasPermission(currentUser, 'VIEW_ALL_USERS')) {
    return users; // Admin vê todos
  }

  // Usuário comum só vê a si mesmo
  return users.filter(user => user.$id === currentUser.id);
};

// Validações de permissões para ações específicas
export const canCreateAdventure = (user: IUser): boolean => {
  return hasPermission(user, 'CREATE_ADVENTURE');
};

export const canEditAdventure = (user: IUser, adventure?: Models.Document): boolean => {
  if (!adventure) return hasPermission(user, 'EDIT_ADVENTURE');
  
  // Por enquanto só admins podem editar aventuras
  return hasPermission(user, 'EDIT_ADVENTURE');
};

export const canDeleteAdventure = (user: IUser, adventure?: Models.Document): boolean => {
  if (!adventure) return hasPermission(user, 'DELETE_ADVENTURE');
  
  // Por enquanto só admins podem deletar aventuras
  return hasPermission(user, 'DELETE_ADVENTURE');
};

export const canManageParticipants = (user: IUser, adventure?: Models.Document): boolean => {
  if (!adventure) return hasPermission(user, 'MANAGE_PARTICIPANTS');
  
  // Por enquanto só admins podem gerenciar participantes
  return hasPermission(user, 'MANAGE_PARTICIPANTS');
};

export const canToggleAdventureVisibility = (user: IUser, adventure?: Models.Document): boolean => {
  if (!adventure) return hasPermission(user, 'TOGGLE_ADVENTURE_VISIBILITY');
  
  // Só admins podem tornar aventuras públicas/privadas
  return hasPermission(user, 'TOGGLE_ADVENTURE_VISIBILITY');
};

export const canCreatePost = (user: IUser): boolean => {
  // Verificação temporária por IDs hardcoded
  const allowedIds = [
    "2f9599f6-f734-4ba4-b351-90a5958a90cf",
    "9977be99-cc64-48df-bb5a-42daba635447",
    "09f99d93-9cdc-4dcd-b698-da1574506f6f",
    "b6b5df9c-9d09-4614-9920-684cc0effb7a"
  ];
  
  return allowedIds.includes(user.id);
};

export const canCreatePublicPost = (user: IUser): boolean => {
  // Por enquanto, mesma verificação que posts normais
  return canCreatePost(user);
};

export const canEditPost = (user: IUser, post?: Models.Document): boolean => {
  if (!post) return false;
  
  // Próprio usuário ou admin
  return post.creator?.$id === user.id || hasPermission(user, 'EDIT_ANY_POST');
};

export const canDeletePost = (user: IUser, post?: Models.Document): boolean => {
  if (!post) return false;
  
  // Próprio usuário ou admin
  return post.creator?.$id === user.id || hasPermission(user, 'DELETE_ANY_POST');
};

// Verificações de visibilidade para posts
export const canViewPost = (
  user: IUser, 
  post: Models.Document, 
  userAdventures: string[],
  publicAdventures: string[] = []
): { canView: boolean; reason: string } => {
  // Admin vê todos os posts
  if (hasPermission(user, 'VIEW_ALL_POSTS')) {
    return { canView: true, reason: 'admin' };
  }

  // Post público (sem aventuras)
  if (!post.adventures || post.adventures.length === 0) {
    return { canView: true, reason: 'public_post' };
  }

  // Post em aventuras públicas
  if (post.adventures.some((id: string) => publicAdventures.includes(id))) {
    return { canView: true, reason: 'public_adventure' };
  }

  // Post em aventuras onde é participante
  if (post.adventures.some((id: string) => userAdventures.includes(id))) {
    return { canView: true, reason: 'participant' };
  }

  return { canView: false, reason: 'no_access' };
};

// Verificações de visibilidade para aventuras
export const canViewAdventure = (
  user: IUser,
  adventure: Models.Document,
  userAdventures: string[]
): { canView: boolean; reason: string } => {
  // Admin vê todas as aventuras
  if (hasPermission(user, 'VIEW_INACTIVE_ADVENTURES')) {
    return { canView: true, reason: 'admin' };
  }

  // Aventuras inativas só para admins
  if (adventure.status !== 'active') {
    return { canView: false, reason: 'inactive' };
  }

  // Aventuras públicas ativas são visíveis para todos
  if (adventure.isPublic) {
    return { canView: true, reason: 'public_adventure' };
  }

  // Aventuras privadas só para participantes
  if (userAdventures.includes(adventure.$id)) {
    return { canView: true, reason: 'participant' };
  }

  return { canView: false, reason: 'no_access' };
};

// Função para obter contexto de acesso do usuário
export const getUserAccessContext = (
  user: IUser,
  userAdventures: string[],
  publicAdventures: string[]
): {
  hasAccess: boolean;
  accessType: 'admin' | 'participant' | 'public' | 'none';
  accessDescription: string;
  canCreateContent: boolean;
} => {
  if (hasPermission(user, 'ACCESS_ADMIN_PANEL')) {
    return {
      hasAccess: true,
      accessType: 'admin',
      accessDescription: 'Acesso total como administrador',
      canCreateContent: true
    };
  }

  if (userAdventures.length > 0) {
    return {
      hasAccess: true,
      accessType: 'participant',
      accessDescription: `Participante de ${userAdventures.length} aventura(s)`,
      canCreateContent: canCreatePost(user)
    };
  }

  if (publicAdventures.length > 0) {
    return {
      hasAccess: true,
      accessType: 'public',
      accessDescription: `Acesso via ${publicAdventures.length} aventura(s) pública(s)`,
      canCreateContent: canCreatePost(user)
    };
  }

  return {
    hasAccess: false,
    accessType: 'none',
    accessDescription: 'Aguardando convite para aventuras',
    canCreateContent: false
  };
};

// Função para obter permissões de filtro
export const getFilterPermissions = (user: IUser) => {
  return {
    canFilterByAdventure: true, // Todos podem filtrar por aventura
    canFilterByVisibility: true, // Todos podem filtrar por visibilidade
    canFilterByStatus: hasPermission(user, 'VIEW_INACTIVE_ADVENTURES'), // Só admins
    canSeeStats: hasPermission(user, 'VIEW_SYSTEM_STATS'), // Só admins
    canSeeHiddenCount: hasPermission(user, 'BYPASS_FILTERS'), // Só admins
  };
};

// Função para obter mensagem de erro baseada na permissão
export const getPermissionErrorMessage = (
  permission: PermissionKey
): string => {
  const messages: Record<PermissionKey, string> = {
    CREATE_ADVENTURE: "Você precisa ser administrador para criar aventuras.",
    EDIT_ADVENTURE: "Você não tem permissão para editar esta aventura.",
    DELETE_ADVENTURE: "Você não tem permissão para deletar esta aventura.",
    MANAGE_PARTICIPANTS: "Você não tem permissão para gerenciar participantes.",
    VIEW_INACTIVE_ADVENTURES: "Apenas administradores podem ver aventuras inativas.",
    TOGGLE_ADVENTURE_VISIBILITY: "Apenas administradores podem alterar a visibilidade de aventuras.",
    CREATE_POST: "Você não tem permissão para criar posts.",
    CREATE_PUBLIC_POST: "Você não tem permissão para criar posts públicos.",
    EDIT_ANY_POST: "Você só pode editar seus próprios posts.",
    DELETE_ANY_POST: "Você só pode deletar seus próprios posts.",
    VIEW_ALL_POSTS: "Você só pode ver posts das aventuras onde participa ou posts públicos.",
    VIEW_ALL_USERS: "Você não tem permissão para ver todos os usuários.",
    EDIT_USER_ROLES: "Apenas administradores podem alterar roles de usuários.",
    ACCESS_ADMIN_PANEL: "Acesso negado à área administrativa.",
    VIEW_SYSTEM_STATS: "Você não tem permissão para ver estatísticas do sistema.",
    MANAGE_SYSTEM_SETTINGS: "Apenas administradores podem alterar configurações do sistema.",
    BYPASS_FILTERS: "Você não pode ignorar filtros de conteúdo.",
  };

  return messages[permission] || "Você não tem permissão para realizar esta ação.";
};

// Validação de permissões para criação de posts em aventuras específicas
export const canPostInAdventures = (
  user: IUser,
  selectedAdventures: string[],
  userAdventures: string[],
  publicAdventures: string[] = []
): { canPost: boolean; reason: string; blockedAdventures: string[] } => {
  // Admin pode postar em qualquer lugar
  if (hasPermission(user, 'VIEW_ALL_POSTS')) {
    return { canPost: true, reason: 'admin', blockedAdventures: [] };
  }

  // Se não selecionou aventuras (post público)
  if (selectedAdventures.length === 0) {
    return { 
      canPost: canCreatePublicPost(user), 
      reason: canCreatePublicPost(user) ? 'public_post' : 'no_permission',
      blockedAdventures: []
    };
  }

  // Verificar acesso a todas as aventuras selecionadas
  const allUserAdventures = [...new Set([...userAdventures, ...publicAdventures])];
  const blockedAdventures = selectedAdventures.filter(id => !allUserAdventures.includes(id));

  if (blockedAdventures.length > 0) {
    return {
      canPost: false,
      reason: 'no_access_to_adventures',
      blockedAdventures
    };
  }

  return {
    canPost: canCreatePost(user),
    reason: canCreatePost(user) ? 'has_access' : 'no_permission',
    blockedAdventures: []
  };
};

// Função para debug de permissões (apenas em desenvolvimento)
export const debugPermissions = (user: IUser) => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.group(`🔐 Permissões do usuário: ${user.name} (${user.role})`);
  
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  userPermissions.forEach(permission => {
    console.log(`✅ ${permission}`);
  });
  
  console.groupEnd();
};