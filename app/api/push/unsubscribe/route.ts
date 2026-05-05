import { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { ok, error as apiError } from "@/lib/api/response";
import { checkApiRateLimit, logApiResponse } from "@/lib/api/guards";

const { auth: getSession } = NextAuth(authConfig);

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      const result = apiError(401, "unauthorized", "Authentication required");
      logApiResponse(req, null, result.status, startTime);
      return result;
    }

    const { response: rateLimitResponse } = await checkApiRateLimit(req, session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { endpoint } = await req.json();

    if (endpoint) {
      // Mark as revoked (soft delete)
      await prisma.pushSubscription.updateMany({
        where: {
          userId: session.user.id,
          endpoint: endpoint,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    const result = ok({ success: true });
    logApiResponse(req, session.user.id, result.status, startTime);
    return result;
  } catch (err) {
    console.error("Push Unsubscribe Error:", err);
    const result = apiError(500, "internal_error", "Failed to unsubscribe from push notifications");
    logApiResponse(req, null, result.status, startTime);
    return result;
  }
}
