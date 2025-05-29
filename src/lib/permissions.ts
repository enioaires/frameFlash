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

  // Posts
  CREATE_POST: 'create_post',
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
} as const;

// Tipo para as chaves de permissões
type PermissionKey = keyof typeof PERMISSIONS;
type PermissionValue = (typeof PERMISSIONS)[PermissionKey];

// Mapeamento de roles para permissões - CORRIGIDO
export const ROLE_PERMISSIONS: Record<'admin' | 'user', PermissionValue[]> = {
  admin: [
    PERMISSIONS.CREATE_ADVENTURE,
    PERMISSIONS.EDIT_ADVENTURE,
    PERMISSIONS.DELETE_ADVENTURE,
    PERMISSIONS.MANAGE_PARTICIPANTS,
    PERMISSIONS.VIEW_INACTIVE_ADVENTURES,
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.EDIT_ANY_POST,
    PERMISSIONS.DELETE_ANY_POST,
    PERMISSIONS.VIEW_ALL_POSTS,
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.EDIT_USER_ROLES,
    PERMISSIONS.ACCESS_ADMIN_PANEL,
    PERMISSIONS.VIEW_SYSTEM_STATS,
    PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
  ],
  user: [
    PERMISSIONS.CREATE_POST, // Com restrições
  ],
};

// Função para verificar se usuário tem permissão específica - CORRIGIDA
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
  user: IUser
): Models.Document[] => {
  if (hasPermission(user, 'VIEW_INACTIVE_ADVENTURES')) {
    return adventures; // Admin vê todas
  }
  
  return adventures.filter(adventure => adventure.status === 'active');
};

export const filterPostsByPermissions = (
  posts: Models.Document[],
  user: IUser,
  userAdventures: string[]
): Models.Document[] => {
  if (hasPermission(user, 'VIEW_ALL_POSTS')) {
    return posts; // Admin vê todos
  }

  // Usuário comum só vê posts das aventuras onde participa
  return posts.filter(post => 
    post.adventures && 
    post.adventures.some((adventureId: string) => 
      userAdventures.includes(adventureId)
    )
  );
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

export const canViewPost = (
  user: IUser, 
  post: Models.Document, 
  userAdventures: string[]
): boolean => {
  // Admin vê todos os posts
  if (hasPermission(user, 'VIEW_ALL_POSTS')) {
    return true;
  }

  // Usuário vê posts das aventuras onde participa
  if (post.adventures && post.adventures.length > 0) {
    return post.adventures.some((adventureId: string) => 
      userAdventures.includes(adventureId)
    );
  }

  return false;
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
    CREATE_POST: "Você não tem permissão para criar posts.",
    EDIT_ANY_POST: "Você só pode editar seus próprios posts.",
    DELETE_ANY_POST: "Você só pode deletar seus próprios posts.",
    VIEW_ALL_POSTS: "Você só pode ver posts das aventuras onde participa.",
    VIEW_ALL_USERS: "Você não tem permissão para ver todos os usuários.",
    EDIT_USER_ROLES: "Apenas administradores podem alterar roles de usuários.",
    ACCESS_ADMIN_PANEL: "Acesso negado à área administrativa.",
    VIEW_SYSTEM_STATS: "Você não tem permissão para ver estatísticas do sistema.",
    MANAGE_SYSTEM_SETTINGS: "Apenas administradores podem alterar configurações do sistema.",
  };

  return messages[permission] || "Você não tem permissão para realizar esta ação.";
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