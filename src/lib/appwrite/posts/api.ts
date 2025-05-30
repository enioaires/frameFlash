/* eslint-disable @typescript-eslint/no-explicit-any */

import { INewPost, IUpdatePost } from "@/types";
import { appwriteConfig, database, storage } from "../config";

import { Query } from "appwrite";
import { v4 } from "uuid";

export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      v4(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      "top",
      100
    );

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

export async function createPost(post: INewPost) {
  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Prepare captions - handle both string and legacy array format
    let captions: string | string[];
    if (typeof post.captions === 'string') {
      captions = post.captions;
    } else {
      // Legacy support for array format
      captions = Array.isArray(post.captions) ? post.captions : [post.captions];
    }

    // Ensure adventures is an array (empty array for public posts)
    const adventures = post.adventures || [];

    // Create post
    const newPost = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      v4(),
      {
        creator: post.userId,
        title: post.title,
        captions: captions,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        adventures: adventures, // Can be empty array for public posts
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Prepare captions - handle both string and legacy array format
    let captions: string | string[];
    if (typeof post.captions === 'string') {
      captions = post.captions;
    } else {
      // Legacy support for array format
      captions = Array.isArray(post.captions) ? post.captions : [post.captions];
    }

    // Ensure adventures is an array (empty array for public posts)
    const adventures = post.adventures || [];

    //  Update post
    const updatedPost = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        title: post.title,
        captions: captions,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        adventures: adventures, // Can be empty array for public posts
        tags: tags,
      }
    );

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;

  try {
    const statusCode = await database.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

export async function getRecentPosts() {
  const posts = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    [Query.orderDesc('$createdAt'), Query.limit(20)]
  )

  if (!posts) throw Error

  return posts
}

// NOVA: Buscar posts por aventuras específicas
export async function getPostsByAdventures(adventureIds: string[]) {
  try {
    if (!adventureIds || adventureIds.length === 0) {
      return { documents: [] };
    }

    const posts = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [
        Query.search('adventures', adventureIds.join(',')),
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log("Error getting posts by adventures:", error);
    throw error;
  }
}

// ATUALIZADA: Buscar posts filtrados por aventuras do usuário + posts públicos
export async function getFilteredPostsForUser(userAdventureIds: string[], publicAdventureIds: string[] = [], isAdmin: boolean = false) {
  try {
    if (isAdmin) {
      // Admins veem todos os posts
      return await getRecentPosts();
    }

    // Buscar posts públicos (sem aventuras)
    const publicPosts = await getPublicPosts();

    let userPosts: any = { documents: [] }; // Fix: usar any ao invés de never[]
    
    // Buscar posts das aventuras do usuário (privadas + públicas)
    const allUserAdventureIds = [...new Set([...userAdventureIds, ...publicAdventureIds])];
    
    if (allUserAdventureIds.length > 0) {
      userPosts = await getPostsByAdventures(allUserAdventureIds);
    }

    // Combinar posts públicos + posts das aventuras
    const allPosts = [
      ...publicPosts.documents,
      ...userPosts.documents
    ];

    // Remover duplicatas por ID
    const uniquePosts = allPosts.filter((post, index, array) =>
      array.findIndex(p => p.$id === post.$id) === index
    );

    // Ordenar por data (mais recentes primeiro)
    const sortedPosts = uniquePosts.sort((a, b) => 
      new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
    );

    return {
      ...publicPosts,
      documents: sortedPosts
    };
  } catch (error) {
    console.log("Error getting filtered posts for user:", error);
    throw error;
  }
}

export async function getPostsByTag(tagName: string) {
  try {
    if (!tagName) return { documents: [] };

    // Busca todos os posts recentes
    const posts = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(100)]
    );

    if (!posts) throw Error;

    // Normaliza a tag de busca (remove acentos, converte para minúsculo)
    const normalizeText = (text: string) => 
      text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const normalizedSearchTag = normalizeText(tagName);

    // Filtra posts que contenham a tag (case-insensitive, sem acentos)
    const filteredPosts = {
      ...posts,
      documents: posts.documents.filter((post: any) => 
        post.tags && post.tags.some((tag: string) => 
          normalizeText(tag).includes(normalizedSearchTag)
        )
      )
    };

    return filteredPosts;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// ATUALIZADA: Filtrar posts por tag E aventuras do usuário + posts públicos
export async function getPostsByTagForUser(tagName: string, userAdventureIds: string[], publicAdventureIds: string[] = [], isAdmin: boolean = false) {
  try {
    if (!tagName) return { documents: [] };

    let posts;
    
    if (isAdmin) {
      // Admins veem todos os posts
      posts = await getPostsByTag(tagName);
    } else {
      // Buscar todos os posts da tag
      const allTagPosts = await getPostsByTag(tagName);
      
      // Filtrar posts que o usuário pode ver
      const filteredPosts = {
        ...allTagPosts,
        documents: allTagPosts.documents.filter((post: any) => {
          // Post público (sem aventuras)
          if (!post.adventures || post.adventures.length === 0) {
            return true;
          }
          
          // Post em aventuras do usuário (privadas + públicas)
          const allUserAdventureIds = [...new Set([...userAdventureIds, ...publicAdventureIds])];
          return post.adventures.some((adventureId: string) => 
            allUserAdventureIds.includes(adventureId)
          );
        })
      };
      
      posts = filteredPosts;
    }

    return posts;
  } catch (error) {
    console.log("Error getting posts by tag for user:", error);
    throw error;
  }
}

export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray
      }
    )

    if (!updatedPost) throw Error

    return updatedPost
  } catch (error) {
    console.log(error)
  }
}

export async function savePost(postId: string, userId: string) {
  try {
    const updatedPost = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      v4(),
      {
        user: userId,
        post: postId
      }
    )

    if (!updatedPost) throw Error

    return updatedPost
  } catch (error) {
    console.log(error)
  }
}

export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await database.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    )

    if (!statusCode) throw Error

    return { status: "ok" }
  } catch (error) {
    console.log(error)
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await database.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    )

    if (!post) throw Error

    return post
  } catch (error) {
    console.log(error)
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc('$createdAt'), Query.limit(20)]

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()))
  }

  try {
    const posts = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    )

    if (!posts) throw Error

    return posts
  } catch (error) {
    console.log(error)
  }
}

export async function searchPosts(searchTerm: string) {
  try {
    const posts = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search('caption', searchTerm)]
    )

    if (!posts) throw Error

    return posts
  } catch (error) {
    console.log(error)
  }
}

export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const post = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

export async function getPublicPosts() {
  try {
    const posts = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [
        Query.equal('adventures', []), // Posts sem aventuras
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log("Error getting public posts:", error);
    throw error;
  }
}