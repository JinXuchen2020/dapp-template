import NextAuth, { CredentialsSignin, NextAuthConfig, User } from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import Resend from "next-auth/providers/resend"
import { getUserFromDb } from "./utils/db"
import { Provider } from "next-auth/providers"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import client from "@/utils/mongodb"
import { AdapterUser } from "next-auth/adapters"

export interface AuthUser extends AdapterUser {
  role: string
}

const monogoAdapter = MongoDBAdapter(client, { databaseName: "nextauth" });

const providers: Provider[] = [
  GitHub({
    clientId: process.env.NEXTAUTH_GITHUB_CLIENT_ID,
    clientSecret: process.env.NEXTAUTH_GITHUB_CLIENT_SECRET,
    profile: (profile) => {
      return {
        id: profile.id.toString(),
        name: profile.name || profile.login,
        email: profile.email,
        image: profile.avatar_url,
        role: "user",
      } as AuthUser
    },
  }), 
  Resend({
    apiKey: process.env.AUTH_RESEND_KEY,
  }),
  Credentials({
    credentials: {
      Email: {
        name: "Email",
        type: "email",
        label: "Email",
        placeholder: "Enter your email",
        value: ""
      },
      Password: {
        name: "Password",
        type: "password",
        label: "Password",
        placeholder: "Enter your password",
        value: ""
      }
    },
    authorize: async (credentials, req) => {
      if (!credentials.Password) {
        throw new CredentialsSignin();
      }
      const { Email, Password } = credentials

      //const user = await getUserFromDb(Email as string, Password as string);
      let userDB = await monogoAdapter.getUserByEmail!(Email as string);
      if (!userDB) {
        userDB = {
          id: "1",
          name: "Admin",
          email: Email as string,
          image: "",
          role: "admin"
        } as AuthUser
        userDB = await monogoAdapter.createUser!(userDB);
      }
      return userDB
    },    
  })
]
 
export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider()
      return { id: providerData.id, name: providerData.name }
    } else {
      return { id: provider.id, name: provider.name }
    }
  })
  .filter((provider) => provider.id !== "credentials")

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: monogoAdapter,
  providers,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if(user) token.role = (user as any).role
      return token
    },
    session: async ({ session, user, token }) => {
      if(user) (session.user as any).role = (user as any).role
      if(token) (session.user as any).role = (token as any).role
      return session
    },
  },
});