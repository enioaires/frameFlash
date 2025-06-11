/* eslint-disable @typescript-eslint/no-explicit-any */

import { account, appwriteConfig, avatars, database } from '../config';

import { INewUser, type IUpdateUser } from "@/types";
import { Query } from 'appwrite';
import { v4 } from 'uuid'
import { deleteFile, getFilePreview, uploadFile } from '../posts/api';

export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      v4(),
      user.email,
      user.password,
      user.name
    )

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name)

    const newUser = await saveUserToDatabase({
      accountId: newAccount.$id,
      email: newAccount.email,
      name: newAccount.name,
      imageUrl: avatarUrl,
      username: user.username,
      role: 'user' // NOVO: definir role padrão
    })

    return newUser
  } catch (error) {
    console.log(error)
    return error
  }
}

export async function saveUserToDatabase(user: {
  accountId: string,
  email: string,
  name: string,
  imageUrl: URL,
  username?: string,
  role?: 'admin' | 'user'
}) {
  try {
    const newUser = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      v4(),
      {
        ...user,
        role: user.role || 'user',
        lastSeen: new Date().toISOString() // ADICIONAR lastSeen na criação
      }
    )

    return newUser
  } catch (error) {
    console.log(error)
  }
}

export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailSession(user.email, user.password);
    
    if (!session) {
      throw new Error('Failed to create session');
    }

    return session;
  } catch (error) {
    // Re-throw com mensagem mais clara
    if (error && typeof error === 'object' && 'type' in error) {
      const errorType = (error as any).type;
      if (errorType === 'user_invalid_credentials') {
        throw new Error('Invalid credentials');
      }
      if (errorType === 'user_blocked') {
        throw new Error('Account blocked');
      }
    }
    
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw new Error('No account found');

    const currentUser = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    );

    if (!currentUser || currentUser.documents.length === 0) {
      throw new Error('User document not found');
    }

    return currentUser.documents[0];
  } catch (error) {
    // Não loggar erros de sessão expirada - são normais
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as any).code;
      if (errorCode === 401 || errorCode === 'user_session_not_found') {
        return null; // Sessão expirada, retorna null
      }
    }
    
    console.error('getCurrentUser error:', error);
    return null;
  }
}


export async function signOutAccount() {
  try {
    // Tentar deletar sessão atual
    const session = await account.deleteSession('current');
    
    // Limpar storage local
    try {
      localStorage.removeItem('cookieFallback');
    } catch (storageError) {
      // Ignorar erros de storage
    }

    return session;
  } catch (error) {
    // Mesmo se falhar, limpar storage local
    try {
      localStorage.removeItem('cookieFallback');
    } catch (storageError) {
      // Ignorar erros de storage
    }
    
    // Re-throw apenas se não for erro de sessão
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as any).code;
      if (errorCode === 401 || errorCode === 'user_session_not_found') {
        return null; // Sessão já não existia
      }
    }
    
    throw error;
  }
}

export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await database.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    //  Update user
    const updatedUser = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}

export async function getUsersByRole(role: 'admin' | 'user') {
  try {
    const users = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [
        Query.equal('role', role),
        Query.orderDesc('$createdAt')
      ]
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log("Error getting users by role:", error);
    throw error;
  }
}

export async function checkIfUserIsAdmin(userId: string): Promise<boolean> {
  try {
    const user = await getUserById(userId);
    return user?.role === 'admin';
  } catch (error) {
    console.log("Error checking if user is admin:", error);
    return false;
  }
}

export async function updateUserRole(userId: string, role: 'admin' | 'user') {
  try {
    const updatedUser = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      {
        role: role
      }
    );

    if (!updatedUser) throw Error;

    return updatedUser;
  } catch (error) {
    console.log("Error updating user role:", error);
    throw error;
  }
}

export async function updateUserLastSeen(userId: string) {
  try {
    const updatedUser = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      {
        lastSeen: new Date().toISOString()
      }
    );

    return updatedUser;
  } catch (error) {
    // Falhar silenciosamente para não interromper a experiência
    // console.error("Error updating last seen:", error);
    return null;
  }
}

export async function getUsersWithLastSeen() {
  try {
    const users = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [
        Query.orderDesc("lastSeen"),
        Query.limit(100)
      ]
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log("Error getting users with last seen:", error);
    throw error;
  }
}

export async function initializeUserLastSeen(userId: string) {
  try {
    const user = await getUserById(userId);
    
    // Se o usuário não tem lastSeen, definir agora
    if (!user?.lastSeen) {
      const updatedUser = await database.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId,
        {
          lastSeen: new Date().toISOString()
        }
      );
      return updatedUser;
    }
    
    return user;
  } catch (error) {
    console.warn("Error initializing user last seen:", error);
    return null;
  }
}

export async function initializeAllUsersLastSeen() {
  try {
    // Buscar todos os usuários
    const users = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.limit(1000)] // Ajustar limite conforme necessário
    );

    const promises = users.documents.map(async (user) => {
      // Se o usuário não tem lastSeen, inicializar
      if (!user.lastSeen) {
        try {
          await database.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            user.$id,
            {
              lastSeen: new Date().toISOString()
            }
          );
          console.log(`LastSeen inicializado para ${user.name}`);
        } catch (error) {
          console.log(`Erro ao inicializar lastSeen para ${user.name}:`, error);
        }
      }
    });

    await Promise.all(promises);
    console.log('Inicialização de lastSeen concluída');
    
    return { success: true };
  } catch (error) {
    console.log("Error initializing all users last seen:", error);
    return { success: false, error };
  }
}