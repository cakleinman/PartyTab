import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { hashPin, isValidPin } from "@/lib/auth/pin";
import { setSessionUserId } from "@/lib/session/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const displayName = body?.displayName?.trim();
    const pin = body?.pin?.trim();

    if (!displayName || typeof displayName !== "string") {
      throwApiError(400, "validation_error", "Display name is required");
    }
    if (!pin || !isValidPin(pin)) {
      throwApiError(400, "validation_error", "PIN must be 4 digits");
    }

    const pinHash = hashPin(pin);

    // Find user by display name + PIN hash combo
    const user = await prisma.user.findFirst({
      where: { displayName, pinHash },
    });

    if (!user) {
      throwApiError(401, "unauthorized", "No account found with that name and PIN. Check your details or join a tab first.");
    }

    // Set session cookie
    await setSessionUserId(user.id);

    return ok({ user: { id: user.id, displayName: user.displayName } });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
