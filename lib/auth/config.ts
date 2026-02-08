import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { SESSION_COOKIE, parseSession } from "@/lib/session/parse";
import { verifyPassword } from "./password";

async function getGuestUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(SESSION_COOKIE)?.value;
    if (!raw) return null;
    return parseSession(raw);
  } catch {
    return null;
  }
}

async function getGuestUser(): Promise<{ id: string; displayName: string } | null> {
  const guestUserId = await getGuestUserId();
  if (!guestUserId) return null;

  const user = await prisma.user.findUnique({
    where: { id: guestUserId },
    select: { id: true, displayName: true, pinHash: true },
  });

  // Only return if user has a PIN (is a real guest, not a placeholder)
  if (!user || !user.pinHash) return null;
  return { id: user.id, displayName: user.displayName };
}

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await verifyPassword(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Check for existing guest session - we'll prompt for merge confirmation
        const guestUser = await getGuestUser();

        // For Google sign in, ensure user exists in our User table
        let existingGoogleUser = await prisma.user.findUnique({
          where: { googleId: account.providerAccountId },
        });

        if (!existingGoogleUser) {
          // Check if there's a user with this email (might be from email signup)
          const emailUser = user.email
            ? await prisma.user.findUnique({ where: { email: user.email } })
            : null;

          if (emailUser) {
            // Link Google to existing email account — preserve existing tier if higher than BASIC
            await prisma.user.update({
              where: { id: emailUser.id },
              data: {
                googleId: account.providerAccountId,
                authProvider: "GOOGLE",
                ...(emailUser.subscriptionTier === "GUEST"
                  ? { subscriptionTier: "BASIC" }
                  : {}),
              },
            });
            existingGoogleUser = await prisma.user.findUnique({
              where: { id: emailUser.id },
            });
          } else {
            // Create new user
            existingGoogleUser = await prisma.user.create({
              data: {
                email: user.email!,
                displayName: user.name || user.email!.split("@")[0],
                googleId: account.providerAccountId,
                authProvider: "GOOGLE",
                subscriptionTier: "BASIC",
              },
            });
          }
        } else {
          // Existing Google user - ensure they have BASIC tier (upgrade from GUEST if needed)
          if (existingGoogleUser.subscriptionTier === "GUEST") {
            await prisma.user.update({
              where: { id: existingGoogleUser.id },
              data: { subscriptionTier: "BASIC" },
            });
          }
        }

        // If there was a guest session with a different user, set pending merge cookie
        // The user will be redirected to confirm the merge with their PIN
        if (guestUser && existingGoogleUser && guestUser.id !== existingGoogleUser.id) {
          try {
            const cookieStore = await cookies();
            // Store pending merge info (will be used by merge confirmation page)
            cookieStore.set("pending_merge", JSON.stringify({
              guestUserId: guestUser.id,
              guestDisplayName: guestUser.displayName,
              targetUserId: existingGoogleUser.id,
            }), {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 10, // 10 minutes
              path: "/",
            });
          } catch (error) {
            console.error("Failed to set pending merge cookie:", error);
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
  session: {
    strategy: "jwt",
  },
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
