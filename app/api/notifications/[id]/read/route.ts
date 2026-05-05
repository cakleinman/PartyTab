import { prisma } from "@/lib/db/prisma";
import { ok, error as apiError, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, checkApiRateLimit, logApiResponse } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const { id: rawId } = await params;
    const id = parseUuid(rawId, "id");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }

    const { response: rateLimitResponse } = await checkApiRateLimit(request, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const notification = await prisma.inAppNotification.findUnique({
      where: { id },
    });

    if (!notification) {
      throwApiError(404, "not_found", "Notification not found");
    }

    if (notification.userId !== user.id) {
      throwApiError(403, "forbidden", "Forbidden");
    }

    const updated = await prisma.inAppNotification.update({
      where: { id },
      data: { read: true },
    });

    const result = ok({ notification: updated });
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
