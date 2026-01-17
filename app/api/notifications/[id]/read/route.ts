import { prisma } from "@/lib/db/prisma";
import { ok, error as apiError, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseUuid(rawId, "id");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }

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

    return ok({ notification: updated });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
