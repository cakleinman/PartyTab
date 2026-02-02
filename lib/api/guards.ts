import { prisma } from "@/lib/db/prisma";
import { getSessionUserId, setSessionUserId } from "@/lib/session/session";
import { parseDisplayName } from "@/lib/validators/schemas";
import { throwApiError } from "@/lib/api/errors";
import { hashPin, isValidPin } from "@/lib/auth/pin";

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
