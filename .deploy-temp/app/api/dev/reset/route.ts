import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { resetDatabase, seedDemo } from "@/lib/dev/seed";

export async function POST() {
  try {
    if (process.env.NODE_ENV === "production") {
      throwApiError(403, "forbidden", "Dev-only endpoint");
    }

    await resetDatabase(prisma);
    const result = await seedDemo(prisma);

    return ok({
      activeTabId: result.activeTabId,
      closedTabId: result.closedTabId,
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
