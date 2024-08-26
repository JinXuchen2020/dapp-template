import { AuthUser } from "@/auth"

export const getUserFromDb = async (userEmail: string, userPassword: string) : Promise<AuthUser | null> => {
  return {
    id: "1",
    name: "John Doe",
    email: userEmail,
    role: 'admin',
  } as AuthUser
}