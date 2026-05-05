import { prisma } from "@/lib/db/prisma";
import { ok, error as apiError, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, checkApiRateLimit, logApiResponse } from "@/lib/api/guards";

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }

    const { response: rateLimitResponse } = await checkApiRateLimit(request, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const updateResult = await prisma.inAppNotification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });

    const result = ok({ success: true, count: updateResult.count });
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
