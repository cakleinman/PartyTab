import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "./password";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        displayName: { label: "Display Name", type: "text" },
        isSignUp: { label: "Is Sign Up", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const displayName = credentials.displayName as string;
        const isSignUp = credentials.isSignUp === "true";

        if (isSignUp) {
          // Sign up flow
          if (!displayName) {
            throw new Error("Display name is required");
          }

          // Check if email already exists
          const existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (existingUser) {
            throw new Error("Email already registered");
          }

          // Create new user
          const passwordHash = await hashPassword(password);
          const user = await prisma.user.create({
            data: {
              email,
              displayName,
              passwordHash,
              authProvider: "EMAIL",
            },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.displayName,
          };
        } else {
          // Sign in flow
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.passwordHash) {
            throw new Error("Invalid email or password");
          }

          const isValid = await verifyPassword(password, user.passwordHash);
          if (!isValid) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.displayName,
          };
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // For Google sign in, ensure user exists in our User table
        const existingUser = await prisma.user.findUnique({
          where: { googleId: account.providerAccountId },
        });

        if (!existingUser) {
          // Check if there's a user with this email (might be from email signup)
          const emailUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (emailUser) {
            // Link Google to existing email account
            await prisma.user.update({
              where: { id: emailUser.id },
              data: {
                googleId: account.providerAccountId,
                authProvider: "GOOGLE",
              },
            });
          } else {
            // Create new user
            await prisma.user.create({
              data: {
                email: user.email!,
                displayName: user.name || user.email!.split("@")[0],
                googleId: account.providerAccountId,
                authProvider: "GOOGLE",
              },
            });
          }
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // First sign in - get our internal user ID
        let dbUser;
        if (account?.provider === "google") {
          dbUser = await prisma.user.findUnique({
            where: { googleId: account.providerAccountId },
          });
        } else if (user.email) {
          dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
        }

        if (dbUser) {
          token.userId = dbUser.id;
          token.displayName = dbUser.displayName;
          token.authProvider = dbUser.authProvider;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.displayName = token.displayName as string;
        session.user.authProvider = token.authProvider as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/tabs", // Redirect here after first sign up
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET || process.env.SESSION_SECRET,
};

// Type augmentation for session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      displayName: string;
      authProvider: string;
    };
  }

  interface JWT {
    userId: string;
    displayName: string;
    authProvider: string;
  }
}
