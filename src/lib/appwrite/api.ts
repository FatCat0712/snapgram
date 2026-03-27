import type { INewUser } from "@/types";
import { AccountService, AvatarsService, DatabaseService } from "./config";
import { ID } from "appwrite";

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
    return error;
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
      "default",
      "users",
      ID.unique(),
      {
        accountId: user.accountId,
        name: user.name,
      }
    );
    console.log("User data saved to DB:", newUser);
    return newUser;
  } catch (error) {
    console.error("Error saving user data to DB:", error);
    return error;
  }
}
