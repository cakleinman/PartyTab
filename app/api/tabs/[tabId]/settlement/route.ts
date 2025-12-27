import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant, requireTab } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tabId: string }> },
) {
  try {
    const { tabId: rawTabId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    const tab = await requireTab(tabId);
    await requireParticipant(tabId, user.id);

    if (tab.status !== "CLOSED") {
      throwApiError(409, "tab_closed", "Tab is not closed");
    }

    const settlement = await prisma.settlement.findUnique({
      where: { tabId },
      include: { transfers: true },
    });

    if (!settlement) {
      throwApiError(404, "not_found", "Settlement not found");
    }

    return ok({
      settlement: {
        createdAt: settlement.createdAt.toISOString(),
        transfers: settlement.transfers.map((transfer) => ({
          fromParticipantId: transfer.fromParticipantId,
          toParticipantId: transfer.toParticipantId,
          amountCents: transfer.amountCents,
        })),
      },
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
