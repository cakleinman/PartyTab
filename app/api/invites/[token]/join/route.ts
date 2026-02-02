import { prisma } from "@/lib/db/prisma";
import { created, error as apiError, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { generatePin, hashPin } from "@/lib/auth/pin";
import { getSessionUserId, setSessionUserId } from "@/lib/session/session";
import { parseDisplayName } from "@/lib/validators/schemas";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: { tab: true },
    });
    if (!invite || invite.revokedAt) {
      throwApiError(404, "not_found", "Invite not found");
    }
    const body = await request.json();

    // Check for existing session
    const sessionUserId = await getSessionUserId();
    let user;
    let generatedPin: string | undefined;

    if (sessionUserId) {
      // Existing session - use that user
      user = await prisma.user.findUnique({ where: { id: sessionUserId } });
      if (!user) {
        throwApiError(401, "unauthorized", "Session expired");
      }
    } else {
      // No session - need to create/find user
      const displayName = parseDisplayName(body?.displayName);

      if (invite.tab.status === "CLOSED") {
        // Closed tab re-auth - require existing PIN from body
        const pin = body?.pin;
        if (!pin) {
          throwApiError(400, "validation_error", "PIN is required for closed tabs");
        }
        const pinHash = await hashPin(String(pin));
        user = await prisma.user.findFirst({
          where: { displayName, pinHash },
        });
        if (!user) {
          throwApiError(401, "unauthorized", "Invalid name or PIN");
        }
        await setSessionUserId(user.id);
      } else {
        // Active tab - generate PIN for new user
        generatedPin = generatePin();
        const pinHash = await hashPin(generatedPin);

        // Check for existing user (unlikely with random PIN, but handle anyway)
        const existingUser = await prisma.user.findFirst({
          where: { displayName, pinHash },
        });

        if (existingUser) {
          user = existingUser;
        } else {
          user = await prisma.user.create({
            data: { displayName, pinHash },
          });
        }

        await setSessionUserId(user.id);
      }
    }

    const existing = await prisma.participant.findUnique({
      where: { tabId_userId: { tabId: invite.tabId, userId: user.id } },
    });

    // If tab is closed, only allow existing participants to re-authenticate
    if (invite.tab.status === "CLOSED") {
      if (!existing) {
        throwApiError(409, "tab_closed", "This tab is closed and not accepting new participants.");
      }
      // Existing participant re-authenticating - redirect to settlement
      return created({
        joined: true,
        tabId: invite.tabId,
        redirectToSettlement: true,
      });
    }

    if (!existing) {
      await prisma.participant.create({
        data: { tabId: invite.tabId, userId: user.id },
      });
    }

    // Return generated PIN and display name for new users on active tabs
    if (generatedPin) {
      return created({
        joined: true,
        tabId: invite.tabId,
        pin: generatedPin,
        displayName: user.displayName,
      });
    }

    return created({
      joined: true,
      tabId: invite.tabId,
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
