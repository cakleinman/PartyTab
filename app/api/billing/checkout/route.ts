import { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { createCheckoutSession } from "@/lib/stripe/billing";
import { z } from "zod";
import { ok, error as apiError, validationError } from "@/lib/api/response";
import { checkApiRateLimit, logApiResponse } from "@/lib/api/guards";

const { auth: getSession } = NextAuth(authConfig);

const checkoutSchema = z.object({
  plan: z.enum(["monthly", "annual"]),
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await getSession();
    if (!session?.user?.id || !session?.user?.email) {
      const result = apiError(401, "unauthorized", "Authentication required");
      logApiResponse(req, null, result.status, startTime);
      return result;
    }

    const { response: rateLimitResponse } = await checkApiRateLimit(req, session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      const errResult = validationError(result.error);
      logApiResponse(req, session.user.id, errResult.status, startTime);
      return errResult;
    }

    const { plan } = result.data;

    // Create checkout session
    const url = await createCheckoutSession(
      session.user.id,
      session.user.email,
      plan
    );

    const successResult = ok({ url });
    logApiResponse(req, session.user.id, successResult.status, startTime);
    return successResult;
  } catch (err) {
    console.error("Checkout Error:", err);
    const result = apiError(500, "internal_error", "Failed to create checkout session");
    logApiResponse(req, null, result.status, startTime);
    return result;
  }
}
