import { cookies } from "next/headers";
import crypto from "crypto";
import { auth } from "@/app/api/auth/[...nextauth]/route";

const SESSION_COOKIE = "partytab_session";

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to 32+ characters");
  }
  return secret;
}

function sign(value: string): string {
  const secret = getSessionSecret();
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function serialize(userId: string): string {
  const signature = sign(userId);
  return `${userId}.${signature}`;
}

function parseSession(value: string): string | null {
  const [userId, signature] = value.split(".");
  if (!userId || !signature) return null;
  const expected = sign(userId);
  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (signatureBuf.length !== expectedBuf.length) return null;
  return crypto.timingSafeEqual(signatureBuf, expectedBuf) ? userId : null;
}

export async function getSessionUserId(): Promise<string | null> {
  // First check NextAuth session (Google/Email authenticated users)
  try {
    const session = await auth();
    if (session?.user?.id) {
      return session.user.id;
    }
  } catch {
    // NextAuth session check failed, continue to guest session
  }

  // Fall back to guest session cookie
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return parseSession(raw);
}

export async function setSessionUserId(userId: string) {
  const cookieStore = await cookies();
  const value = serialize(userId);
  cookieStore.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
