import { prisma } from "@/lib/db/prisma";
import { getSessionUserId, setSessionUserId } from "@/lib/session/session";
import { parseDisplayName } from "@/lib/validators/schemas";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError } from "@/lib/api/errors";

export async function GET() {
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return ok({ user: null });
    }
    const user = await prisma.user.findUnique({
      where: { id: sessionUserId },
      select: { id: true, displayName: true, authProvider: true, subscriptionTier: true },
    });
    if (!user) {
      return ok({ user: null });
    }
    return ok({ user });
  } catch {
    return apiError(500, "forbidden", "Unexpected error");
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const displayName = parseDisplayName(body?.displayName);
    const sessionUserId = await getSessionUserId();

    if (!sessionUserId) {
      const user = await prisma.user.create({
        data: { displayName },
        select: { id: true, displayName: true },
      });
      await setSessionUserId(user.id);
      return ok({ user });
    }

    const user = await prisma.user.update({
      where: { id: sessionUserId },
      data: { displayName },
      select: { id: true, displayName: true },
    });
    return ok({ user });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
