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

  const { subscription } = await req.json();

  if (!subscription || !subscription.endpoint) {
    return apiError(400, "validation_error", "Invalid subscription");
  }

  // Store subscription
  await prisma.pushSubscription.create({
    data: {
      userId: session.user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });

  return ok({ success: true });
}
