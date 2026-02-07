import { cookies } from "next/headers";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { SESSION_COOKIE, serializeSession, parseSession } from "./parse";

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
  const value = serializeSession(userId);
  const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
  cookieStore.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: thirtyDaysInSeconds,
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
