import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";

// Session parsing (duplicated from session.ts to avoid circular deps)
function parseGuestSession(value: string): string | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return null;

  const [userId, signature] = value.split(".");
  if (!userId || !signature) return null;

  const expected = crypto.createHmac("sha256", secret).update(userId).digest("hex");
  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (signatureBuf.length !== expectedBuf.length) return null;
  return crypto.timingSafeEqual(signatureBuf, expectedBuf) ? userId : null;
}

async function getGuestUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("partytab_session")?.value;
    if (!raw) return null;
    return parseGuestSession(raw);
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
  providers: [Google],
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
            // Link Google to existing email account
            await prisma.user.update({
              where: { id: emailUser.id },
              data: {
                googleId: account.providerAccountId,
                authProvider: "GOOGLE",
                subscriptionTier: "BASIC",
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
