import { prisma } from "@/lib/db/prisma";
import { created, error as apiError, validationError } from "@/lib/api/response";
import { isApiError } from "@/lib/api/errors";
import { getSessionUserId } from "@/lib/session/session";
import { getClientIp, checkGenericRateLimit } from "@/lib/auth/rate-limit";
import { resolveUserForInvite, joinTabAsParticipant } from "@/lib/auth/invite-join";
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
