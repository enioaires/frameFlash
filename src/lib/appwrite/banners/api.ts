/* eslint-disable @typescript-eslint/no-explicit-any */

import { INewBanner, IUpdateBanner } from "@/types";
import { appwriteConfig, database } from "../config";
import { deleteFile, getFilePreview, uploadFile } from "../posts/api";

import { Query } from "appwrite";
import { v4 } from "uuid";

// ==================== BANNERS CRUD ====================

export async function createBanner(banner: INewBanner) {
  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(banner.file[0]);

    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Create banner
    const newBanner = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.bannersCollectionId,
      v4(),
      {
        type: banner.type,
        identifier: banner.identifier,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        title: banner.title || "",
      }
    );

    if (!newBanner) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newBanner;
  } catch (error) {
    console.log("Error creating banner:", error);
    throw error;
  }
}

export async function updateBanner(banner: IUpdateBanner) {
  const hasFileToUpdate = banner.file.length > 0;

  try {
    let image = {
      imageUrl: banner.imageUrl,
      imageId: banner.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(banner.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Update banner
    const updatedBanner = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.bannersCollectionId,
      banner.bannerId,
      {
        type: banner.type,
        identifier: banner.identifier,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        title: banner.title || "",
      }
    );

    // Failed to update
    if (!updatedBanner) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      throw Error;
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(banner.imageId);
    }

    return updatedBanner;
  } catch (error) {
    console.log("Error updating banner:", error);
    throw error;
  }
}

export async function getBanners() {
  try {
    const banners = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.bannersCollectionId,
      [Query.orderDesc('$createdAt')]
    );

    if (!banners) throw Error;

    return banners;
  } catch (error) {
    console.log("Error getting banners:", error);
    throw error;
  }
}

export async function getBannerById(bannerId: string) {
  try {
    const banner = await database.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.bannersCollectionId,
      bannerId
    );

    if (!banner) throw Error;

    return banner;
  } catch (error) {
    console.log("Error getting banner by ID:", error);
    throw error;
  }
}

export async function getBannerByTypeAndIdentifier(type: 'home' | 'tag', identifier: string) {
  try {
    const banners = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.bannersCollectionId,
      [
        Query.equal('type', type),
        Query.equal('identifier', identifier),
        Query.limit(1)
      ]
    );

    if (!banners || banners.documents.length === 0) {
      // Return null if no banner found - let components handle fallback
      return null;
    }

    return banners.documents[0];
  } catch (error) {
    console.log("Error getting banner by type and identifier:", error);
    // Return null on error - let components handle fallback
    return null;
  }
}

export async function deleteBanner(bannerId: string, imageId: string) {
  try {
    // Delete the banner document
    const statusCode = await database.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.bannersCollectionId,
      bannerId
    );

    if (!statusCode) throw Error;

    // Delete the image file
    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log("Error deleting banner:", error);
    throw error;
  }
}

// ==================== UTILITY FUNCTIONS ====================

export async function getHomeBanner() {
  return getBannerByTypeAndIdentifier('home', 'main');
}

export async function getTagBanner(tagIdentifier: string) {
  return getBannerByTypeAndIdentifier('tag', tagIdentifier);
}

export async function getAllTagBanners() {
  try {
    const banners = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.bannersCollectionId,
      [
        Query.equal('type', 'tag'),
        Query.orderDesc('$createdAt')
      ]
    );

    if (!banners) throw Error;

    return banners;
  } catch (error) {
    console.log("Error getting tag banners:", error);
    throw error;
  }
}

// ==================== BANNER EXISTENCE CHECK ====================

export async function ensureBannerExists(type: 'home' | 'tag', identifier: string) {
  try {
    const existing = await getBannerByTypeAndIdentifier(type, identifier);
    
    // If no banner exists, create one with default image
    if (!existing) {
      const defaultBanner = await database.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.bannersCollectionId,
        v4(),
        {
          type,
          identifier,
          imageUrl: "https://fra.cloud.appwrite.io/v1/storage/buckets/6838e3a400362003b2ce/files/6838e3c700212167feae/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          imageId: "6838e3c700212167feae",
          title: type === 'home' ? 'Banner Principal' : `Banner - ${identifier}`
        }
      );
      
      return defaultBanner;
    }
    
    return existing;
  } catch (error) {
    console.log("Error ensuring banner exists:", error);
    throw error;
  }
}