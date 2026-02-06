import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getClientIp, checkGenericRateLimit } from "@/lib/auth/rate-limit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
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

  try {
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
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
