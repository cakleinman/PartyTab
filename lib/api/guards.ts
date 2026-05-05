import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUserId, setSessionUserId } from "@/lib/session/session";
import { parseDisplayName } from "@/lib/validators/schemas";
import { throwApiError } from "@/lib/api/errors";
import { hashPin, isValidPin } from "@/lib/auth/pin";
import { checkUserRateLimit } from "@/lib/auth/rate-limit";
import { rateLimited } from "@/lib/api/response";
import { logApiRequest } from "@/lib/api/audit-log";

export async function getUserFromSession() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function requireUser(displayNameValue?: unknown, pinValue?: unknown) {
  const sessionUserId = await getSessionUserId();
  if (sessionUserId) {
    const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
    if (!user) {
      throwApiError(401, "unauthorized", "Session expired");
    }
    return user;
  }

  if (displayNameValue === undefined) {
    throwApiError(401, "unauthorized", "Display name required");
  }

  const displayName = parseDisplayName(displayNameValue);

  // Validate PIN
  if (pinValue === undefined || pinValue === null || pinValue === "") {
    throwApiError(400, "validation_error", "PIN is required");
  }
  const pin = String(pinValue);
  if (!isValidPin(pin)) {
    throwApiError(400, "validation_error", "PIN must be exactly 4 digits");
  }

  const pinHash = await hashPin(pin);

  // Check if user with this exact name + PIN combo exists (reconnect flow)
  const existingUser = await prisma.user.findFirst({
    where: { displayName, pinHash },
  });

  if (existingUser) {
    // Reconnect - restore session for existing user
    await setSessionUserId(existingUser.id);
    return existingUser;
  }

  // Same name with different PIN is allowed - create new user
  // The unique constraint on [displayName, pinHash] ensures no duplicates
  const user = await prisma.user.create({
    data: { displayName, pinHash },
  });
  await setSessionUserId(user.id);
  return user;
}

export async function requireTab(tabId: string) {
  const tab = await prisma.tab.findUnique({ where: { id: tabId } });
  if (!tab) {
    throwApiError(404, "not_found", "Tab not found");
  }
  return tab;
}

export async function requireOpenTab(tabId: string) {
  const tab = await requireTab(tabId);
  if (tab.status === "CLOSED") {
    throwApiError(409, "tab_closed", "This tab is closed");
  }
  return tab;
}

export async function requireParticipant(tabId: string, userId: string) {
  const participant = await prisma.participant.findUnique({
    where: {
      tabId_userId: {
        tabId,
        userId,
      },
    },
  });
  if (!participant) {
    throwApiError(403, "not_participant", "Not a participant in this tab");
  }
  return participant;
}

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Content-type validation + per-user rate limiting for manual try/catch routes.
 * Call after getUserFromSession(). Returns a Response if blocked, null otherwise.
 * Also returns a startTime for audit logging via logApiResponse().
 */
export async function checkApiRateLimit(
  request: Request,
  userId?: string,
): Promise<{ response: NextResponse; startTime: number } | { response: null; startTime: number }> {
  const startTime = Date.now();

  // Content-Type check for mutations
  if (MUTATION_METHODS.has(request.method)) {
    const ct = request.headers.get("content-type");
    if (ct && !ct.includes("application/json") && !ct.includes("multipart/form-data")) {
      return {
        response: NextResponse.json(
          { error: { code: "validation_error", message: "Content-Type must be application/json" } },
          { status: 415 },
        ),
        startTime,
      };
    }
  }

  // Per-user rate limit
  if (userId) {
    const blocked = await checkUserRateLimit(userId);
    if (blocked) {
      return { response: rateLimited(blocked.retryAfter), startTime };
    }
  }

  return { response: null, startTime };
}

/**
 * Log an API request for audit trail. Call before returning from manual routes.
 */
export function logApiResponse(
  request: Request,
  userId: string | null,
  statusCode: number,
  startTime: number,
): void {
  logApiRequest({
    timestamp: new Date().toISOString(),
    method: request.method,
    path: new URL(request.url).pathname,
    userId,
    statusCode,
    durationMs: Date.now() - startTime,
  });
}
