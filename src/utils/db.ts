'use server'
import { AuthUser } from "@/auth";
import { monogoAdapter } from "@/utils/mongodb";

export const getUserFromDb = async (userEmail: string, userPassword: string) : Promise<AuthUser | null> => {
  // return {
  //   id: "1",
  //   name: "John Doe",
  //   email: userEmail,
  //   role: 'admin',
  // } as AuthUser
  let userDB = await monogoAdapter.getUserByEmail!(userEmail as string);
  if (!userDB) {
    userDB = {
      id: "1",
      name: "Admin",
      email: userEmail as string,
      image: "",
      role: "admin"
    } as AuthUser
    userDB = await monogoAdapter.createUser!(userDB);
  }

  return userDB as AuthUser;
}