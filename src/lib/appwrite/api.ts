import { v4 } from 'uuid'
import { INewUser } from "@/types";
import { account, appwriteConfig, avatars, database } from "./config";
import { Query } from 'appwrite';

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
      username: user.username
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
  username?: string
}) {
  try {
    const newUser = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      v4(),
      user
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