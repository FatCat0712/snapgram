import type { INewPost, INewUser, IUpdatePost } from "@/types";

type AppwriteUserDoc = {
  $id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
  savedPosts: unknown[];
};
import {
  AccountService,
  AvatarsService,
  DatabaseService,
  StorageService,
  appWriteConfig,
} from "./config";
import { ID, Query } from "appwrite";

function isMissingAccountScopeError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as {
    code?: unknown;
    type?: unknown;
    message?: unknown;
  };

  const isUnauthorized = maybeError.code === 401;
  const isScopeType = maybeError.type === "general_unauthorized_scope";
  const hasAccountScopeMessage =
    typeof maybeError.message === "string" &&
    maybeError.message.includes("missing scopes") &&
    maybeError.message.includes("account");

  return isUnauthorized && (isScopeType || hasAccountScopeMessage);
}

function getFileView(fileId: string) {
  try {
    const fileUrl = StorageService.getFileView(
      appWriteConfig.storageBucketId,
      fileId,
    );

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    console.error("Error getting file view:", error);
    throw error;
  }
}

export function getRelationshipId(value: unknown): string | null {
  if (typeof value === "string") return value;

  if (value && typeof value === "object" && "$id" in value) {
    const id = (value as { $id: unknown }).$id;
    return typeof id === "string" ? id : null;
  }

  return null;
}

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
  } catch {
    // If no session exists, that's fine
    console.log("No existing session to delete");
    return null;
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

export async function getCurrentUser(): Promise<AppwriteUserDoc | null> {
  try {
    const currentAccount = await AccountService.get();

    if (!currentAccount) return null;

    const currentUser = await DatabaseService.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      [
        Query.equal("accountId", [currentAccount.$id]),
        Query.select(["*", "saves.*", "saves.post.*"]),
      ],
    );

    if (!currentUser?.documents?.[0]) return null;

    return {
      ...currentUser.documents[0],
      savedPosts: Array.isArray(currentUser.documents[0].saves)
        ? currentUser.documents[0].saves
        : [],
    } as unknown as AppwriteUserDoc;
  } catch (error) {
    // Expected during app bootstrap when no active session exists yet.
    if (isMissingAccountScopeError(error)) {
      return null;
    }

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

export async function createPost(post: INewPost) {
  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = getFileView(uploadedFile.$id);

    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Convert tags into array
    const tags = post.tags?.replace(/\s/g, "").split(",") || [];

    // Create post
    const newPost = await DatabaseService.createDocument(
      appWriteConfig.databaseId,
      appWriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl.toString(),
        imageId: uploadedFile.$id,
        location: post.location,
        tags,
        likes: [],
      },
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

export async function uploadFile(file: File) {
  try {
    const uploadedFile = await StorageService.createFile(
      appWriteConfig.storageBucketId,
      ID.unique(),
      file,
    );
    return uploadedFile;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function deleteFile(fieldId: string) {
  try {
    await StorageService.deleteFile(appWriteConfig.storageBucketId, fieldId);
    return { status: "ok" };
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

export async function getRecentPosts() {
  try {
    const posts = await DatabaseService.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.postCollectionId,
      [
        Query.orderDesc("$createdAt"),
        Query.limit(20),
        Query.select(["*", "likes.*"]),
      ],
    );

    // Always expose a non-transform storage URL so plans without image
    // transformations can still render feed images.
    return posts.documents.map((post) => {
      const normalizedLikes = Array.isArray(post.likes)
        ? post.likes
            .map(getRelationshipId)
            .filter((id): id is string => id !== null)
        : [];

      const normalizedPost = {
        ...post,
        likes: normalizedLikes,
      };

      if (!post.imageId) return normalizedPost;

      return {
        ...normalizedPost,
        imageUrl: getFileView(post.imageId).toString(),
      };
    });
  } catch (error) {
    console.log(error);
  }
}

export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await DatabaseService.updateDocument(
      appWriteConfig.databaseId,
      appWriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      },
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
}

export async function savePost(postId: string, userId: string) {
  try {
    const updatedPost = await DatabaseService.createDocument(
      appWriteConfig.databaseId,
      appWriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      },
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.error("Error saving post:", error);
    throw error;
  }
}

export async function deleteSavedPost(savedRecordId: string) {
  try {
    const status = await DatabaseService.deleteDocument(
      appWriteConfig.databaseId,
      appWriteConfig.savesCollectionId,
      savedRecordId,
    );

    if (!status) throw Error;

    return { status: "ok" };
  } catch (error) {
    console.error("Error deleting saved post:", error);
    throw error;
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await DatabaseService.getDocument(
      appWriteConfig.databaseId,
      appWriteConfig.postCollectionId,
      postId,
      [Query.select(["*", "creator.*"])],
    );

    return post;
  } catch (error) {
    console.error("Error getting post by id:", error);
    throw error;
  }
}

export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file && post.file.length > 0;
  try {
    let image = {
      imageUrl: post?.imageUrl?.toString(),
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);

      if (!uploadedFile) throw Error;

      // Get file url
      const fileUrl = getFileView(uploadedFile.$id);

      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = {
        ...image,
        imageUrl: fileUrl.toString(),
        imageId: uploadedFile.$id,
      };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/\s/g, "").split(",") || [];

    // Create post
    const updatedPost = await DatabaseService.updateDocument(
      appWriteConfig.databaseId,
      appWriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags,
        likes: post.likes,
      },
    );

    if (!updatedPost) {
      if (hasFileToUpdate) {
        await deleteFile(post.imageId);
      }
      throw Error;
    }

    return updatedPost;
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
}

export async function deletePost(postId: string, imageId: string) {
  try {
    if (!postId || !imageId) throw Error;
    await DatabaseService.deleteDocument(
      appWriteConfig.databaseId,
      appWriteConfig.postCollectionId,
      postId,
    );

    return { status: "ok" };
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: Parameters<typeof DatabaseService.listDocuments>[2] = [
    Query.select(["*", "creator.*"]),
    Query.select(["*", "likes.*"]),
    Query.orderDesc("$updatedAt"),
    Query.limit(10),
  ];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await DatabaseService.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.postCollectionId,
      queries,
    );

    return posts;
  } catch (error) {
    console.error("Error getting posts:", error);
    throw error;
  }
}

export async function searchPosts(searchTerm: string) {
  try {
    const posts = await DatabaseService.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.postCollectionId,
      [
        Query.search("caption", searchTerm),
        Query.orderDesc("$updatedAt"),
        Query.limit(20),
      ],
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.error("Error searching posts:", error);
    throw error;
  }
}

type TopCreator = {
  $id: string;
  name: string;
  username: string;
  imageUrl: string;
  bio: string;
  postCount: number;
};

export async function getTopCreators(limit = 10): Promise<TopCreator[]> {
  try {
    // 1. Fetch all users (up to 100)
    const users = await DatabaseService.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      [
        Query.limit(100),
        Query.select(["$id", "name", "username", "imageUrl", "bio"]),
      ],
    );

    // 2. For each user, get their post count from the posts collection
    const creatorsWithCount = await Promise.all(
      users.documents.map(async (user) => {
        const posts = await DatabaseService.listDocuments(
          appWriteConfig.databaseId,
          appWriteConfig.postCollectionId,
          [Query.equal("creator", user.$id), Query.limit(1)],
        );
        return { ...(user as unknown as TopCreator), postCount: posts.total };
      }),
    );

    // 3. Sort by post count descending and return top N
    return creatorsWithCount
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting top creators:", error);
    throw error;
  }
}
