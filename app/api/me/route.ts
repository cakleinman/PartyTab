import { prisma } from "@/lib/db/prisma";
import { getSessionUserId, setSessionUserId } from "@/lib/session/session";
import { parseDisplayName, parseEmail } from "@/lib/validators/schemas";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { checkApiRateLimit, logApiResponse } from "@/lib/api/guards";

export async function GET(request: Request) {
  const startTime = Date.now();
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      const result = ok({ user: null });
      logApiResponse(request, null, result.status, startTime);
      return result;
    }

    const { response: rateLimitResponse } = await checkApiRateLimit(request, sessionUserId);
    if (rateLimitResponse) return rateLimitResponse;

    const user = await prisma.user.findUnique({
      where: { id: sessionUserId },
      select: {
        id: true,
        displayName: true,
        email: true,
        authProvider: true,
        subscriptionTier: true,
        entitlement: {
          select: {
            state: true,
          },
        },
        emailPreference: {
          select: {
            reminderEmailsEnabled: true,
          },
        },
        paymentMethods: {
          select: {
            id: true,
            type: true,
            handle: true,
            label: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!user) {
      const result = ok({ user: null });
      logApiResponse(request, sessionUserId, result.status, startTime);
      return result;
    }
    const result = ok({
      user: {
        ...user,
        entitlementState: user.entitlement?.state || "FREE",
        reminderEmailsEnabled: user.emailPreference?.reminderEmailsEnabled ?? true,
      },
    });
    logApiResponse(request, sessionUserId, result.status, startTime);
    return result;
  } catch {
    const result = apiError(500, "internal_error", "Unexpected error");
    logApiResponse(request, null, result.status, startTime);
    return result;
  }
}

export async function PATCH(request: Request) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const sessionUserId = await getSessionUserId();

    // If no session, create a new user (existing behavior)
    if (!sessionUserId) {
      const displayName = parseDisplayName(body?.displayName);
      const user = await prisma.user.create({
        data: { displayName },
        select: { id: true, displayName: true },
      });
      await setSessionUserId(user.id);
      const result = ok({ user });
      logApiResponse(request, user.id, result.status, startTime);
      return result;
    }

    const { response: rateLimitResponse } = await checkApiRateLimit(request, sessionUserId);
    if (rateLimitResponse) return rateLimitResponse;

    const updateData: Record<string, unknown> = {};

    // Display name update
    if (body?.displayName !== undefined) {
      updateData.displayName = parseDisplayName(body.displayName);
    }

    // Email update (only for EMAIL auth users)
    if (body?.email !== undefined) {
      const currentUser = await prisma.user.findUnique({
        where: { id: sessionUserId },
        select: { authProvider: true },
      });
      if (currentUser?.authProvider !== "EMAIL") {
        throwApiError(403, "forbidden", "Email can only be changed for email-authenticated accounts");
      }
      const newEmail = parseEmail(body.email);
      // Check uniqueness
      const existing = await prisma.user.findUnique({
        where: { email: newEmail },
        select: { id: true },
      });
      if (existing && existing.id !== sessionUserId) {
        throwApiError(409, "email_exists", "Email is already in use");
      }
      updateData.email = newEmail;
    }

    // Notification preferences update
    if (body?.reminderEmailsEnabled !== undefined) {
      await prisma.emailPreference.upsert({
        where: { userId: sessionUserId },
        update: { reminderEmailsEnabled: !!body.reminderEmailsEnabled },
        create: { userId: sessionUserId, reminderEmailsEnabled: !!body.reminderEmailsEnabled },
      });
    }

    // Only update user if there are fields to update
    if (Object.keys(updateData).length > 0) {
      const user = await prisma.user.update({
        where: { id: sessionUserId },
        data: updateData,
        select: { id: true, displayName: true, email: true },
      });
      const result = ok({ user });
      logApiResponse(request, sessionUserId, result.status, startTime);
      return result;
    }

    const result = ok({ success: true });
    logApiResponse(request, sessionUserId, result.status, startTime);
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
