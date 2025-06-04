import { Account, Avatars, Client, Databases, Storage } from 'appwrite'

export const appwriteConfig = {
  url: import.meta.env.VITE_APPWRITE_URL,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID,
  userCollectionId: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
  postCollectionId: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID,
  savesCollectionId: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
  adventureCollectionId: import.meta.env.VITE_APPWRITE_ADVENTURE_COLLECTION_ID,
  adventureParticipantsCollectionId: import.meta.env.VITE_APPWRITE_ADVENTURE_PARTICIPANTS_COLLECTION_ID,
  bannersCollectionId: import.meta.env.VITE_APPWRITE_BANNERS_COLLECTION_ID,
  commentsCollectionId: import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID,
}

export const client = new Client()

client.setProject(appwriteConfig.projectId)
client.setEndpoint(appwriteConfig.url)

export const account = new Account(client)
export const database = new Databases(client)
export const storage = new Storage(client)
export const avatars = new Avatars(client)