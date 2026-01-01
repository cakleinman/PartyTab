import { prisma } from "@/lib/db/prisma";
import { created, error as apiError, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { requireUser } from "@/lib/api/guards";

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
    const user = await requireUser(body?.displayName, body?.pin);

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
