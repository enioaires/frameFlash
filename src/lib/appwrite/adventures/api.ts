/* eslint-disable @typescript-eslint/no-explicit-any */

import { INewAdventure, INewAdventureParticipant, IUpdateAdventure } from "@/types";
import { appwriteConfig, database } from "../config";
import { deleteFile, getFilePreview, uploadFile } from "../posts/api";

import { Query } from "appwrite";
import { v4 } from "uuid";

// ==================== ADVENTURES CRUD ====================

export async function createAdventure(adventure: INewAdventure) {
  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(adventure.file[0]);

    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Create adventure
    const newAdventure = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.adventureCollectionId,
      v4(),
      {
        title: adventure.title,
        description: adventure.description || "",
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        status: adventure.status,
        createdBy: adventure.createdBy,
      }
    );

    if (!newAdventure) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newAdventure;
  } catch (error) {
    console.log("Error creating adventure:", error);
    throw error;
  }
}

export async function updateAdventure(adventure: IUpdateAdventure) {
  const hasFileToUpdate = adventure.file.length > 0;

  try {
    let image = {
      imageUrl: adventure.imageUrl,
      imageId: adventure.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(adventure.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Update adventure
    const updatedAdventure = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.adventureCollectionId,
      adventure.adventureId,
      {
        title: adventure.title,
        description: adventure.description || "",
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        status: adventure.status,
      }
    );

    // Failed to update
    if (!updatedAdventure) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      throw Error;
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(adventure.imageId);
    }

    return updatedAdventure;
  } catch (error) {
    console.log("Error updating adventure:", error);
    throw error;
  }
}

export async function getAdventures() {
  try {
    const adventures = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.adventureCollectionId,
      [Query.orderDesc('$createdAt')]
    );

    if (!adventures) throw Error;

    return adventures;
  } catch (error) {
    console.log("Error getting adventures:", error);
    throw error;
  }
}

export async function getAdventureById(adventureId: string) {
  try {
    const adventure = await database.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.adventureCollectionId,
      adventureId
    );

    if (!adventure) throw Error;

    return adventure;
  } catch (error) {
    console.log("Error getting adventure by ID:", error);
    throw error;
  }
}

export async function getActiveAdventures() {
  try {
    const adventures = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.adventureCollectionId,
      [
        Query.equal('status', 'active'),
        Query.orderDesc('$createdAt')
      ]
    );

    if (!adventures) throw Error;

    return adventures;
  } catch (error) {
    console.log("Error getting active adventures:", error);
    throw error;
  }
}

export async function deleteAdventure(adventureId: string, imageId: string) {
  try {
    // First, delete all participants
    await removeAllParticipantsFromAdventure(adventureId);

    // Delete the adventure document
    const statusCode = await database.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.adventureCollectionId,
      adventureId
    );

    if (!statusCode) throw Error;

    // Delete the image file
    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log("Error deleting adventure:", error);
    throw error;
  }
}

// ==================== ADVENTURE PARTICIPANTS ====================

export async function addParticipant(participant: INewAdventureParticipant) {
  try {
    // Check if participant already exists
    const existingParticipant = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.adventureParticipantsCollectionId,
      [
        Query.equal('adventureId', participant.adventureId),
        Query.equal('userId', participant.userId)
      ]
    );

    if (existingParticipant.documents.length > 0) {
      throw new Error("User is already a participant in this adventure");
    }

    const newParticipant = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.adventureParticipantsCollectionId,
      v4(),
      {
        adventureId: participant.adventureId,
        userId: participant.userId,
        addedBy: participant.addedBy,
      }
    );

    if (!newParticipant) throw Error;

    return newParticipant;
  } catch (error) {
    console.log("Error adding participant:", error);
    throw error;
  }
}

export async function removeParticipant(adventureId: string, userId: string) {
  try {
    // Find the participant record
    const participants = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.adventureParticipantsCollectionId,
      [
        Query.equal('adventureId', adventureId),
        Query.equal('userId', userId)
      ]
    );

    if (participants.documents.length === 0) {
      throw new Error("Participant not found");
    }

    const participantId = participants.documents[0].$id;

    const statusCode = await database.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.adventureParticipantsCollectionId,
      participantId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log("Error removing participant:", error);
    throw error;
  }
}

export async function getAdventureParticipants(adventureId: string) {
  try {
    const participants = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.adventureParticipantsCollectionId,
      [
        Query.equal('adventureId', adventureId),
        Query.orderDesc('$createdAt')
      ]
    );

    if (!participants) throw Error;

    return participants;
  } catch (error) {
    console.log("Error getting adventure participants:", error);
    throw error;
  }
}

export async function getUserAdventures(userId: string) {
  try {
    const participants = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.adventureParticipantsCollectionId,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt')
      ]
    );

    if (!participants) throw Error;

    return participants;
  } catch (error) {
    console.log("Error getting user adventures:", error);
    throw error;
  }
}

export async function removeAllParticipantsFromAdventure(adventureId: string) {
  try {
    const participants = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.adventureParticipantsCollectionId,
      [Query.equal('adventureId', adventureId)]
    );

    // Delete all participants
    for (const participant of participants.documents) {
      await database.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.adventureParticipantsCollectionId,
        participant.$id
      );
    }

    return { status: "Ok" };
  } catch (error) {
    console.log("Error removing all participants:", error);
    throw error;
  }
}

// ==================== UTILITY FUNCTIONS ====================

export async function isUserParticipantInAdventure(userId: string, adventureId: string) {
  try {
    const participants = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.adventureParticipantsCollectionId,
      [
        Query.equal('adventureId', adventureId),
        Query.equal('userId', userId)
      ]
    );

    return participants.documents.length > 0;
  } catch (error) {
    console.log("Error checking user participation:", error);
    return false;
  }
}

export async function getAdventuresForUser(userId: string, userRole: string) {
  try {
    if (userRole === 'admin') {
      // Admins see all adventures
      return await getAdventures();
    } else {
      // Regular users see only adventures they participate in
      const userParticipations = await getUserAdventures(userId);
      const adventureIds = userParticipations.documents.map(p => p.adventureId);
      
      if (adventureIds.length === 0) {
        return { documents: [] };
      }

      const adventures = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.adventureCollectionId,
        [
          Query.equal('$id', adventureIds),
          Query.equal('status', 'active'),
          Query.orderDesc('$createdAt')
        ]
      );

      return adventures;
    }
  } catch (error) {
    console.log("Error getting adventures for user:", error);
    throw error;
  }
}