import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok } from "@/lib/api/response";
import { throwApiError } from "@/lib/api/errors";
import { getClientIp, checkGenericRateLimit } from "@/lib/auth/rate-limit";
import { withApiHandler } from "@/lib/api/handler";

export const GET = withApiHandler<{ token: string }>(async (request, { params }) => {
  // Rate limiting to prevent token enumeration
  const clientIp = getClientIp(request);
  const rateLimitResult = await checkGenericRateLimit(clientIp, "invite-lookup");
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
    throwApiError(404, "not_found", "Invite not found");
  }

  return ok({
    invite: { token: invite.token },
    tab: { id: invite.tab.id, name: invite.tab.name, status: invite.tab.status },
  });
});
