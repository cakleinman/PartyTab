import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { STEP_UP_COOKIE, STEP_UP_TTL_MS, serializeStepUp } from "@/lib/auth/stepUpCookie";

// Step-up re-auth landing endpoint for Google users. Reached only via
// signIn("google", ..., { prompt: "login" }) with this URL as callbackUrl —
// see app/components/PaymentMethodForm.tsx. The load-bearing check is
// token.googleSignInAt, a custom claim stamped in lib/auth/config.ts's jwt
// callback whenever an OAuth callback runs (i.e. only after a real Google
// round-trip). JWT iat refreshes on every /api/auth/session call, so it
// cannot be used as a freshness signal.

const FRESH_WINDOW_MS = 60 * 1000;

function sanitizeNext(raw: string | null): string {
  // Open-redirect prevention: only allow same-origin paths.
  if (!raw) return "/settings";
  if (!raw.startsWith("/")) return "/settings";
  if (raw.startsWith("//")) return "/settings"; // protocol-relative
  return raw;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = sanitizeNext(url.searchParams.get("next"));

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userId = typeof token.userId === "string" ? token.userId : null;
  if (!userId) {
    return NextResponse.redirect(new URL(`${next}?stepup=invalid`, request.url));
  }

  const stampedAt =
    typeof token.googleSignInAt === "number" ? token.googleSignInAt : null;
  if (!stampedAt || Date.now() - stampedAt > FRESH_WINDOW_MS) {
    return NextResponse.redirect(new URL(`${next}?stepup=stale`, request.url));
  }

  const response = NextResponse.redirect(new URL(next, request.url));
  response.cookies.set(STEP_UP_COOKIE, serializeStepUp({ userId, iat: Date.now() }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(STEP_UP_TTL_MS / 1000),
  });
  return response;
}
