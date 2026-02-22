import { prisma } from "@/lib/db/prisma";
import { created, error as apiError } from "@/lib/api/response";
import { throwApiError } from "@/lib/api/errors";
import { getSessionUserId, setSessionUserId } from "@/lib/session/session";
import { getClientIp, checkGenericRateLimit } from "@/lib/auth/rate-limit";
import { resolveUserForInvite, joinTabAsParticipant } from "@/lib/auth/invite-join";
import { mergeGuestToAccount } from "@/lib/auth/merge";
import { generatePin, hashPin } from "@/lib/auth/pin";
import { withApiHandler } from "@/lib/api/handler";

export const POST = withApiHandler<{ token: string }>(async (request, { params }) => {
  // Rate limiting to prevent token enumeration
  const clientIp = getClientIp(request);
  const rateLimitResult = await checkGenericRateLimit(clientIp, "invite-join");
  if (rateLimitResult) {
    return apiError(
      429,
      "rate_limited",
      `Too many requests. Please try again in ${rateLimitResult.retryAfter} seconds.`
    );
  }

  const { token } = await params;
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { tab: true },
  });
  if (!invite || invite.revokedAt) {
    return apiError(404, "not_found", "Invite not found");
  }

  const body = await request.json();
  const sessionUserId = await getSessionUserId();

  // --- Claim flow: user picks an existing unclaimed participant ---
  if (body?.claimParticipantId) {
    const participant = await prisma.participant.findUnique({
      where: { id: body.claimParticipantId },
      include: { user: true },
    });

    if (!participant || participant.tabId !== invite.tabId) {
      throwApiError(404, "not_found", "Participant not found in this tab");
    }

    // Verify the participant's user is a placeholder (no auth credentials)
    const placeholderUser = participant.user;
    if (placeholderUser.pinHash || placeholderUser.googleId || placeholderUser.passwordHash) {
      throwApiError(400, "validation_error", "This participant has already been claimed");
    }

    // Mark any claim tokens for this placeholder as claimed
    await prisma.userClaimToken.updateMany({
      where: { userId: placeholderUser.id, claimedAt: null },
      data: { claimedAt: new Date() },
    });

    if (sessionUserId) {
      // Logged-in user: merge placeholder into their account
      await mergeGuestToAccount(placeholderUser.id, sessionUserId);
      return created({
        joined: true,
        tabId: invite.tabId,
        claimed: true,
      });
    } else {
      // No session: generate PIN for the placeholder user
      const pin = generatePin();
      const pinHash = await hashPin(pin);
      await prisma.user.update({
        where: { id: placeholderUser.id },
        data: { pinHash },
      });
      await setSessionUserId(placeholderUser.id);
      return created({
        joined: true,
        tabId: invite.tabId,
        pin,
        displayName: placeholderUser.displayName,
        claimed: true,
      });
    }
  }

  // --- Standard join flow ---
  // Resolve user (handles session, new user creation, or closed-tab re-auth)
  const { user, generatedPin } = await resolveUserForInvite({
    sessionUserId,
    displayName: body?.displayName,
    pin: body?.pin,
    tabStatus: invite.tab.status,
  });

  // Join the tab (handles participant creation and closed-tab validation)
  const { redirectToSettlement } = await joinTabAsParticipant({
    tabId: invite.tabId,
    userId: user.id,
    tabStatus: invite.tab.status,
  });

  // Return appropriate response based on scenario
  if (redirectToSettlement) {
    return created({
      joined: true,
      tabId: invite.tabId,
      redirectToSettlement: true,
    });
  }

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
});
