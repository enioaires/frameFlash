import { IAdventureOption, IUser } from "@/types";

import { Models } from "appwrite";

// Verificar se usuário é admin
export const isAdmin = (user: IUser): boolean => {
  return user.role === 'admin';
};

// Verificar se usuário é admin por ID (temporário - para transição)
export const isAdminById = (userId: string): boolean => {
  const ADMIN_IDS = [
    "2f9599f6-f734-4ba4-b351-90a5958a90cf",
    "9977be99-cc64-48df-bb5a-42daba635447",
    "09f99d93-9cdc-4dcd-b698-da1574506f6f",
    "b6b5df9c-9d09-4614-9920-684cc0effb7a"
  ];
  return ADMIN_IDS.includes(userId);
};

// Filtrar aventuras baseado no usuário
export const filterAdventuresForUser = (
  adventures: Models.Document[],
  user: IUser,
  userAdventures: string[]
): Models.Document[] => {
  if (isAdmin(user)) {
    // Admins veem todas as aventuras
    return adventures;
  }
  
  // Usuários veem aventuras ativas onde participam OU aventuras públicas ativas
  return adventures.filter(adventure => {
    const isActive = adventure.status === 'active';
    const isPublicAdventure = adventure.isPublic === true;
    const isParticipant = userAdventures.includes(adventure.$id);
    
    return isActive && (isPublicAdventure || isParticipant);
  });
};

// Converter aventuras para options de select
export const adventuresToOptions = (adventures: Models.Document[]): IAdventureOption[] => {
  return adventures.map(adventure => ({
    label: adventure.title,
    value: adventure.$id,
    status: adventure.status
  }));
};

export const getPublicAdventureIds = (adventures: Models.Document[]): string[] => {
  return adventures
    .filter(adventure => adventure.isPublic === true && adventure.status === 'active')
    .map(adventure => adventure.$id);
};

export const isAdventurePublic = (adventure: Models.Document): boolean => {
  return adventure.isPublic === true && adventure.status === 'active';
};

export const canUserAccessAdventure = (
  user: IUser,
  adventure: Models.Document,
  userAdventures: string[]
): boolean => {
  if (isAdmin(user)) {
    return true;
  }
  
  // Usuário pode acessar se for participante ou se for pública e ativa
  const isParticipant = userAdventures.includes(adventure.$id);
  const isPublicAndActive = adventure.isPublic === true && adventure.status === 'active';
  
  return isParticipant || isPublicAndActive;
};

// Verificar se usuário pode ver um post baseado nas aventuras
export const canUserSeePost = (
  user: IUser, 
  postAdventures: string[], 
  userAdventures: string[],
  publicAdventures: string[] = []
): boolean => {
  if (isAdmin(user)) {
    return true;
  }
  
  // Usuário vê o post se estiver em pelo menos uma aventura do post
  // OU se pelo menos uma aventura do post for pública
  return postAdventures.some(adventureId => 
    userAdventures.includes(adventureId) || publicAdventures.includes(adventureId)
  );
};

// Verificar se usuário pode criar post em determinadas aventuras
export const canUserPostInAdventures = (
  user: IUser,
  selectedAdventures: string[],
  userAdventures: string[]
): boolean => {
  if (isAdmin(user)) {
    return true;
  }
  
  // Usuário só pode postar em aventuras onde participa
  return selectedAdventures.every(adventureId => 
    userAdventures.includes(adventureId)
  );
};

// Ordenar aventuras (ativas primeiro, por data de criação)
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

// Validar se usuário pode gerenciar aventura
export const canUserManageAdventure = (user: IUser): boolean => {
  return isAdmin(user);
};

// Obter status badge para aventura
export const getAdventureStatusBadge = (status: 'active' | 'inactive', isPublic: boolean = false) => {
  const statusMap = {
    active: {
      text: isPublic ? 'Pública' : 'Ativa',
      className: isPublic 
        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        : 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    inactive: {
      text: 'Inativa', 
      className: 'bg-red-500/20 text-red-400 border-red-500/30'
    }
  };
  
  return statusMap[status];
};