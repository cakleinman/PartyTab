import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if there's a pending merge cookie after OAuth callback
  const pendingMerge = request.cookies.get("pending_merge");
  const pathname = request.nextUrl.pathname;

  // If user just completed OAuth and has a pending merge, redirect to confirmation
  // Don't redirect if already on the merge page or API routes
  if (
    pendingMerge &&
    !pathname.startsWith("/auth/merge-confirm") &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_next/") &&
    pathname !== "/login"
  ) {
    // Only redirect after OAuth callback (when going to /tabs or callback URL)
    const url = request.nextUrl.clone();
    url.pathname = "/auth/merge-confirm";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)",
  ],
};
