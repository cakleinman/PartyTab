import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from "@simplewebauthn/server";
import { prisma } from "@/lib/db/prisma";
import { SESSION_COOKIE, parseSession } from "@/lib/session/parse";
import {
  EXPECTED_ORIGIN,
  PASSKEY_CHALLENGE_COOKIE,
  PASSKEY_CHALLENGE_TTL_MS,
  RP_ID,
} from "@/lib/passkeys/config";
import { parseChallenge } from "@/lib/passkeys/challengeCookie";
import { verifyPassword } from "./password";

// Per-account brute-force lockout configuration. Complements the IP-based
// limiter in lib/auth/rate-limit.ts — IP throttling slows a single attacker
// while account-level lockout stops distributed credential stuffing.
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

// Real bcrypt hash of an unrelated string, generated once at module load.
// We run bcrypt.compare against this on the "user not found" path so the
// response time matches "user found but wrong password" — without this, the
// fast-return on missing users is an email-enumeration oracle. Cost factor
// 12 to match SALT_ROUNDS in lib/auth/password.ts.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(
  "partytab-timing-equaliser",
  12
);

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
          select: {
            id: true,
            email: true,
            displayName: true,
            passwordHash: true,
            failedLoginAttempts: true,
            lockedUntil: true,
          },
        });

        // Not-found / no-password path: pay the bcrypt cost against a real
        // dummy hash so timing matches the "user found but wrong password"
        // branch. Without this, response time leaks email registration state.
        if (!user?.passwordHash) {
          await bcrypt.compare(credentials.password as string, DUMMY_PASSWORD_HASH);
          return null;
        }

        // Account locked: short-circuit before even checking the password.
        // Same null return as a wrong password — never surface a distinct
        // "locked" message to the caller (it would help an attacker confirm
        // they've triggered the lockout on a real account).
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          return null;
        }

        const isValid = await verifyPassword(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          // Atomic increment to avoid a race when parallel failed logins
          // arrive together (e.g. a credential-stuffing bot). Prisma's
          // `increment` compiles to `SET col = col + 1`, which is safe under
          // concurrency. We read the post-increment value and, if it crosses
          // the threshold, follow up with a lock — that second write is
          // idempotent so a parallel duplicate is harmless.
          const after = await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: { increment: 1 } },
            select: { failedLoginAttempts: true },
          });
          if (after.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
            await prisma.user.update({
              where: { id: user.id },
              data: { lockedUntil: new Date(Date.now() + LOCKOUT_MS) },
            });
          }
          return null;
        }

        // Successful login: reset the failure counter.
        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
        };
      },
    }),
    // Passwordless passkey sign-in. The browser calls signIn("passkey",
    // { assertion: JSON.stringify(...) }) directly; NextAuth then mints the
    // session from authorize()'s return value. All WebAuthn verification
    // happens here so we don't have to mint sessions from a route handler.
    Credentials({
      id: "passkey",
      name: "Passkey",
      credentials: {
        assertion: { label: "Assertion", type: "text" },
      },
      async authorize(credentials) {
        if (typeof credentials?.assertion !== "string") return null;

        let response: AuthenticationResponseJSON;
        try {
          response = JSON.parse(credentials.assertion) as AuthenticationResponseJSON;
        } catch {
          return null;
        }

        const cookieStore = await cookies();
        const cookieRaw = cookieStore.get(PASSKEY_CHALLENGE_COOKIE)?.value;
        cookieStore.delete(PASSKEY_CHALLENGE_COOKIE);

        const challenge = parseChallenge(cookieRaw);
        if (!challenge) return null;
        if (Date.now() - challenge.iat > PASSKEY_CHALLENGE_TTL_MS) return null;

        const credentialIdBuf = Buffer.from(response.id, "base64url");
        const passkey = await prisma.passkey.findUnique({
          where: { credentialId: credentialIdBuf },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true,
                authProvider: true,
              },
            },
          },
        });

        if (!passkey) return null;

        try {
          const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge: challenge.challenge,
            expectedOrigin: EXPECTED_ORIGIN,
            expectedRPID: RP_ID,
            credential: {
              id: response.id,
              publicKey: new Uint8Array(passkey.publicKey),
              counter: Number(passkey.counter),
              transports: passkey.transports as AuthenticatorTransportFuture[],
            },
            requireUserVerification: false,
          });

          if (!verification.verified) return null;

          await prisma.passkey.update({
            where: { id: passkey.id },
            data: {
              counter: BigInt(verification.authenticationInfo.newCounter),
              lastUsedAt: new Date(),
            },
          });
        } catch {
          return null;
        }

        return {
          id: passkey.user.id,
          email: passkey.user.email,
          name: passkey.user.displayName,
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
        // First sign in - resolve our internal user ID. Each provider has a
        // different reliable lookup key.
        let dbUser;
        if (account?.provider === "google") {
          dbUser = await prisma.user.findUnique({
            where: { googleId: account.providerAccountId },
            select: { id: true, email: true, displayName: true, authProvider: true },
          });
        } else if (account?.provider === "passkey" && user.id) {
          // Passkey authorize() returns the internal user.id directly. Look
          // up by id (not email) to avoid colliding accounts that share an
          // email but belong to different auth providers.
          dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true, email: true, displayName: true, authProvider: true },
          });
        } else if (user.email) {
          dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, email: true, displayName: true, authProvider: true },
          });
        }

        if (dbUser) {
          token.userId = dbUser.id;
          token.displayName = dbUser.displayName;
          token.authProvider = dbUser.authProvider;
          // Persist email explicitly. NextAuth populates token.email from the
          // user object on first sign-in, but on subsequent JWT reads (after
          // ~24h refresh) only the token survives — and the session callback
          // below depends on it for downstream consumers like Stripe checkout.
          if (dbUser.email) {
            token.email = dbUser.email;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.displayName = token.displayName as string;
        session.user.authProvider = token.authProvider as string;
        if (typeof token.email === "string") {
          session.user.email = token.email;
        }
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
