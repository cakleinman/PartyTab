import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok } from "@/lib/api/response";
import { throwApiError } from "@/lib/api/errors";
import { hashPin, isValidPin } from "@/lib/auth/pin";
import { setSessionUserId } from "@/lib/session/session";
import {
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
  getClientIp,
} from "@/lib/auth/rate-limit";
import { withSimpleApiHandler } from "@/lib/api/handler";

export const POST = withSimpleApiHandler(async (request: Request) => {
  const clientIp = getClientIp(request);

  // Check rate limit before processing
  const rateLimitResult = await checkRateLimit(clientIp);
  if (rateLimitResult) {
    return apiError(
      429,
      "rate_limited",
      `Too many attempts. Please try again in ${rateLimitResult.retryAfter} seconds.`
    );
  }

  const body = await request.json();
  const displayName = body?.displayName?.trim();
  const pin = body?.pin?.trim();

  if (!displayName || typeof displayName !== "string") {
    throwApiError(400, "validation_error", "Display name is required");
  }
  if (!pin || !isValidPin(pin)) {
    throwApiError(400, "validation_error", "PIN must be 4 digits");
  }

  const pinHash = await hashPin(pin);

  // Find user by display name + PIN hash combo
  const user = await prisma.user.findFirst({
    where: { displayName, pinHash },
  });

  if (!user) {
    recordFailedAttempt(clientIp);
    throwApiError(401, "unauthorized", "No account found with that name and PIN. Check your details or join a tab first.");
  }

  // Clear rate limit on successful login
  clearRateLimit(clientIp);

  // Set session cookie
  await setSessionUserId(user.id);

  return ok({ user: { id: user.id, displayName: user.displayName } });
});
