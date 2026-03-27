import { Client, Account, Databases, Storage, Avatars } from "appwrite";

export const appWriteConfig = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  projectName: import.meta.env.VITE_APPWRITE_PROJECT_NAME,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  storage: import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID,
  savesCollectionId: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
  postCollectionId: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID,
  userCollectionId: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
};

export const client = new Client();

client
  .setEndpoint(appWriteConfig.endpoint)
  .setProject(appWriteConfig.projectId);

export const AccountService = new Account(client);
export const DatabaseService = new Databases(client);
export const StorageService = new Storage(client);
export const AvatarsService = new Avatars(client);
