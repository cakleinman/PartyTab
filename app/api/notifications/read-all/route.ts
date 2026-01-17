import { prisma } from "@/lib/db/prisma";
import { ok, error as apiError, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession } from "@/lib/api/guards";

export async function POST() {
  try {
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }

    const result = await prisma.inAppNotification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });

    return ok({ success: true, count: result.count });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
