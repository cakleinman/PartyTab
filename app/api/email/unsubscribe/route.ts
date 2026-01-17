import { prisma } from "@/lib/db/prisma";
import { ok, error as apiError, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";

/**
 * POST /api/email/unsubscribe
 * Unsubscribe a user from reminder emails.
 * No authentication required (works from email links).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    // Validate token is a valid UUID
    if (!token || typeof token !== "string") {
      throwApiError(400, "validation_error", "Token is required");
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      throwApiError(400, "validation_error", "Invalid token format");
    }

    // Find the user by ID
    const user = await prisma.user.findUnique({
      where: { id: token },
    });

    if (!user) {
      throwApiError(404, "not_found", "User not found");
    }

    // Upsert EmailPreference with reminderEmailsEnabled: false
    await prisma.emailPreference.upsert({
      where: { userId: token },
      create: {
        userId: token,
        reminderEmailsEnabled: false,
        unsubscribedAt: new Date(),
      },
      update: {
        reminderEmailsEnabled: false,
        unsubscribedAt: new Date(),
      },
    });

    return ok({
      success: true,
      message: "Successfully unsubscribed from reminder emails",
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    console.error("Unsubscribe error:", error);
    return validationError(error);
  }
}
