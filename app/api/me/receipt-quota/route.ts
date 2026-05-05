import { ok, error as apiError } from "@/lib/api/response";
import { getUserFromSession, checkApiRateLimit, logApiResponse } from "@/lib/api/guards";
import { getReceiptQuotaInfo } from "@/lib/billing/usage";

export async function GET(request: Request) {
  const startTime = Date.now();
  try {
    const user = await getUserFromSession();
    if (!user) {
      const result = apiError(401, "unauthorized", "Unauthorized");
      logApiResponse(request, null, result.status, startTime);
      return result;
    }

    const { response: rateLimitResponse } = await checkApiRateLimit(request, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const quota = await getReceiptQuotaInfo(user.id);
    const result = ok({ quota });
    logApiResponse(request, user.id, result.status, startTime);
    return result;
  } catch {
    const result = apiError(500, "internal_error", "Failed to fetch receipt quota");
    logApiResponse(request, null, result.status, startTime);
    return result;
  }
}
