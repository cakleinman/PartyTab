import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

const { auth: getSession } = NextAuth(authConfig);

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { endpoint } = await req.json();

  if (endpoint) {
    // Mark as revoked (soft delete) or hard delete?
    // Schema has revokedAt
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

  return NextResponse.json({ success: true });
}
