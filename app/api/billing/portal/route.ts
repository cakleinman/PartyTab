import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { createPortalSession } from "@/lib/stripe/billing";

const { auth: getSession } = NextAuth(authConfig);

export async function POST(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = await createPortalSession(session.user.id);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Portal Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
