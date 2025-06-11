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
      0, // width: 0 = tamanho original
      0, // height: 0 = tamanho original
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

    // Upload audio file if provided
    let audioUrl = null;
    let audioId = null;
    
    if (post.audioFile && post.audioFile.length > 0) {
      const uploadedAudioFile = await uploadFile(post.audioFile[0]);
      
      if (!uploadedAudioFile) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      audioUrl = getAudioFileUrl(uploadedAudioFile.$id);
      audioId = uploadedAudioFile.$id;
      
      if (!audioUrl) {
        await deleteFile(uploadedFile.$id);
        await deleteFile(uploadedAudioFile.$id);
        throw Error;
      }
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
        audioUrl: audioUrl, // NOVO: URL do áudio
        audioId: audioId,   // NOVO: ID do áudio
        adventures: adventures,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      if (audioId) await deleteFile(audioId);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;
  const hasAudioToUpdate = post.audioFile && post.audioFile.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    let audio = {
      audioUrl: post.audioUrl || null,
      audioId: post.audioId || null,
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

    if (hasAudioToUpdate) {
      // Upload new audio file
      const uploadedAudioFile = await uploadFile(post.audioFile![0]);
      if (!uploadedAudioFile) {
        if (hasFileToUpdate) await deleteFile(image.imageId);
        throw Error;
      }

      // Get new audio url
      const audioUrl = getAudioFileUrl(uploadedAudioFile.$id);
      if (!audioUrl) {
        await deleteFile(uploadedAudioFile.$id);
        if (hasFileToUpdate) await deleteFile(image.imageId);
        throw Error;
      }

      audio = { audioUrl: audioUrl.toString(), audioId: uploadedAudioFile.$id };
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
        audioUrl: audio.audioUrl,   // NOVO: URL do áudio
        audioId: audio.audioId,     // NOVO: ID do áudio
        adventures: adventures,
        tags: tags,
      }
    );

    // Failed to update
    if (!updatedPost) {
      // Delete new files that have been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      if (hasAudioToUpdate) {
        await deleteFile(audio.audioId!);
      }

      throw Error;
    }

    // Safely delete old files after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }
    if (hasAudioToUpdate && post.audioId) {
      await deleteFile(post.audioId);
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

export async function getFilteredPostsForUser(userAdventureIds: string[], publicAdventureIds: string[] = [], isAdmin: boolean = false) {
  try {
    if (isAdmin) {
      // Admins veem todos os posts
      return await getRecentPosts();
    }

    // 🆕 PASSO 1: Buscar TODOS os posts públicos (sem aventuras)
    const publicPosts = await getPublicPosts();

    // 🆕 PASSO 2: Buscar posts de aventuras que o usuário tem acesso
    let adventurePosts: any = { documents: [] };
    
    // Combinar IDs de aventuras privadas (onde participa) + públicas
    const allAccessibleAdventureIds = [...new Set([...userAdventureIds, ...publicAdventureIds])];
    
    if (allAccessibleAdventureIds.length > 0) {
      adventurePosts = await getPostsByAdventures(allAccessibleAdventureIds);
    }

    // 🆕 PASSO 3: Combinar posts públicos + posts de aventuras
    const allPosts = [
      ...publicPosts.documents,
      ...adventurePosts.documents
    ];

    // 🆕 PASSO 4: Remover duplicatas por ID
    const uniquePosts = allPosts.filter((post, index, array) =>
      array.findIndex(p => p.$id === post.$id) === index
    );

    // 🆕 PASSO 5: Ordenar por data (mais recentes primeiro)
    const sortedPosts = uniquePosts.sort((a, b) => 
      new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
    );

    console.log('🔍 Posts filtrados:', {
      publicPosts: publicPosts.documents.length,
      adventurePosts: adventurePosts.documents.length,
      totalUnique: uniquePosts.length,
      userAdventureIds,
      publicAdventureIds,
      allAccessibleAdventureIds
    });

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
        Query.equal('adventures', []), // Posts sem aventuras (públicos)
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ]
    );

    if (!posts) throw Error;

    console.log('🌍 Posts públicos encontrados:', posts.documents.length);

    return posts;
  } catch (error) {
    console.log("Error getting public posts:", error);
    throw error;
  }
}

export async function getRecentPostsPaginated(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;
  
  try {
    const posts = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [
        Query.orderDesc('$createdAt'), 
        Query.limit(limit),
        Query.offset(offset)
      ]
    );

    if (!posts) throw Error;

    return {
      ...posts,
      hasMore: posts.documents.length === limit,
      currentPage: page,
      totalPages: Math.ceil((posts.total || 0) / limit)
    };
  } catch (error) {
    console.log("Error getting paginated posts:", error);
    throw error;
  }
}

export function getAudioFileUrl(fileId: string) {
  try {
    const audioUrl = storage.getFileView(
      appwriteConfig.storageId,
      fileId
    );

    if (!audioUrl) throw Error;

    return audioUrl;
  } catch (error) {
    console.log(error);
  }
}