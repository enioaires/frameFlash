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
  role?: 'admin' | 'user' // NOVO CAMPO
}) {
  try {
    const newUser = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      v4(),
      {
        ...user,
        role: user.role || 'user' // Default para 'user'
      }
    )

    return newUser
  } catch (error) {
    console.log(error)
  }
}

export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailSession(user.email, user.password)

    return session
  } catch (error) {
    console.log(error)
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await account.get()

    if (!currentAccount) throw Error

    const currentUser = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    )

    if (!currentUser) throw Error

    return currentUser.documents[0]
  } catch (error) {
    console.log(error)
  }
}

export async function signOutAccount() {
  try {
    const session = await account.deleteSession('current')

    return session
  } catch (error) {
    console.log(error)
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
    console.log("Error updating last seen:", error);
    // Não lançar erro para não quebrar a aplicação
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