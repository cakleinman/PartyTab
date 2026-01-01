import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireTab } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tabId: string; participantId: string }> },
) {
  try {
    const { tabId: rawTabId, participantId: rawParticipantId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const participantId = parseUuid(rawParticipantId, "participantId");

    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }

    const tab = await requireTab(tabId);
    if (tab.createdByUserId !== user.id) {
      throwApiError(403, "forbidden", "Only the tab owner can remove participants");
    }

    if (tab.status === "CLOSED") {
      throwApiError(409, "tab_closed", "Cannot remove participants from a closed tab");
    }

    // Find the participant to remove
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: { user: true },
    });

    if (!participant || participant.tabId !== tabId) {
      throwApiError(404, "not_found", "Participant not found");
    }

    // Cannot remove the tab creator
    if (participant.userId === tab.createdByUserId) {
      throwApiError(400, "validation_error", "Cannot remove the tab owner");
    }

    // Check if participant has any expenses (paid or split)
    const [paidExpenses, splits] = await Promise.all([
      prisma.expense.findFirst({
        where: { tabId, paidByParticipantId: participantId },
      }),
      prisma.expenseSplit.findFirst({
        where: { participantId, expense: { tabId } },
      }),
    ]);

    if (paidExpenses || splits) {
      throwApiError(
        400,
        "validation_error",
        "Cannot remove a participant who has expenses. Delete their expenses first.",
      );
    }

    // Remove the participant
    await prisma.participant.delete({
      where: { id: participantId },
    });

    return ok({ removed: true });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
