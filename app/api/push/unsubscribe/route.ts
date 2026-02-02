import { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { ok, error as apiError } from "@/lib/api/response";

const { auth: getSession } = NextAuth(authConfig);

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return apiError(401, "unauthorized", "Authentication required");
  }

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

  return ok({ success: true });
}
