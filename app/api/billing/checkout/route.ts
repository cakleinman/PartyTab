import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { createCheckoutSession } from "@/lib/stripe/billing";
import { z } from "zod";

const { auth: getSession } = NextAuth(authConfig);

const checkoutSchema = z.object({
  plan: z.enum(["monthly", "annual"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'monthly' or 'annual'." },
        { status: 400 }
      );
    }

    const { plan } = result.data;

    // Create checkout session
    const url = await createCheckoutSession(
      session.user.id,
      session.user.email,
      plan
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
