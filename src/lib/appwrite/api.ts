import type { INewUser } from "@/types";
import {
  AccountService,
  AvatarsService,
  DatabaseService,
  appWriteConfig,
} from "./config";
import { ID, Query } from "appwrite";

export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await AccountService.create({
      userId: ID.unique(),
      email: user.email,
      password: user.password,
      name: user.name,
    });

    if (!newAccount) {
      throw new Error("Failed to create user account");
    }
    const avatarUrl = AvatarsService.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      imageUrl: avatarUrl,
      username: user.username,
    });

    return newUser;
  } catch (error) {
    console.error("Error creating user account:", error);
    throw error;
  }
}

export async function saveUserToDB(user: {
  accountId: string;
  name: string;
  email: string;
  imageUrl: string;
  username?: string;
}) {
  try {
    const newUser = await DatabaseService.createDocument(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: user.accountId,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
        username: user.username,
      },
    );

    return newUser;
  } catch (error) {
    console.error("Error saving user data to DB:", error);
    throw error;
  }
}

export async function deleteExistingSession() {
  try {
    const session = await AccountService.deleteSession("current");
    return session;
  } catch (error) {
    // If no session exists, that's fine
    console.log("No existing session to delete");
    throw error;
  }
}

export async function signInAccount(user: { email: string; password: string }) {
  try {
    // Delete any existing session first to avoid "session already exists" error

    const session = await AccountService.createEmailPasswordSession(
      user.email,
      user.password,
    );
    return session;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await AccountService.get();
    if (!currentAccount) return null;

    const currentUser = await DatabaseService.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      [Query.equal("accountId", [currentAccount.$id])],
    );

    if (!currentUser?.documents?.[0]) return null;

    return currentUser.documents[0];
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function signOutAccount() {
  try {
    const session = await deleteExistingSession();
    return session;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}
