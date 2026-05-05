import { prisma } from "@/lib/db/prisma";
import { ok, error as apiError, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, checkApiRateLimit, logApiResponse } from "@/lib/api/guards";

export async function GET(request: Request) {
  const startTime = Date.now();
  try {
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }

    const { response: rateLimitResponse } = await checkApiRateLimit(request, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const notifications = await prisma.inAppNotification.findMany({
      where: { userId: user.id },
      orderBy: [{ read: "asc" }, { createdAt: "desc" }],
      take: 50,
    });

    const result = ok({ notifications });
    logApiResponse(request, user.id, result.status, startTime);
    return result;
  } catch (error) {
    const userId: string | null = null;
    if (isApiError(error)) {
      const result = apiError(error.status, error.code, error.message);
      logApiResponse(request, userId, result.status, startTime);
      return result;
    }
    const result = validationError(error);
    logApiResponse(request, userId, result.status, startTime);
    return result;
  }
}
