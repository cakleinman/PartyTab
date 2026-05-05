import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { createPortalSession } from "@/lib/stripe/billing";
import { ok, error as apiError } from "@/lib/api/response";
import { checkApiRateLimit, logApiResponse } from "@/lib/api/guards";

const { auth: getSession } = NextAuth(authConfig);

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      const result = apiError(401, "unauthorized", "Authentication required");
      logApiResponse(request, null, result.status, startTime);
      return result;
    }

    const { response: rateLimitResponse } = await checkApiRateLimit(request, session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const url = await createPortalSession(session.user.id);
    const successResult = ok({ url });
    logApiResponse(request, session.user.id, successResult.status, startTime);
    return successResult;
  } catch (err) {
    console.error("Portal Error:", err);
    const result = apiError(500, "internal_error", "Failed to create portal session");
    logApiResponse(request, null, result.status, startTime);
    return result;
  }
}
