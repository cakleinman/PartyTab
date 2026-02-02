import { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { createCheckoutSession } from "@/lib/stripe/billing";
import { z } from "zod";
import { ok, error as apiError, validationError } from "@/lib/api/response";

const { auth: getSession } = NextAuth(authConfig);

const checkoutSchema = z.object({
  plan: z.enum(["monthly", "annual"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id || !session?.user?.email) {
      return apiError(401, "unauthorized", "Authentication required");
    }

    const body = await req.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return validationError(result.error);
    }

    const { plan } = result.data;

    // Create checkout session
    const url = await createCheckoutSession(
      session.user.id,
      session.user.email,
      plan
    );

    return ok({ url });
  } catch (err) {
    console.error("Checkout Error:", err);
    return apiError(500, "internal_error", "Failed to create checkout session");
  }
}
