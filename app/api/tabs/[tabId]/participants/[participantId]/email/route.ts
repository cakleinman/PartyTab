import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireTab } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";
import { requirePro } from "@/lib/auth/entitlements";
import { computeNets } from "@/lib/settlement/computeSettlement";

// Simple email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tabId: string; participantId: string }> },
) {
  try {
    const { tabId: rawTabId, participantId: rawParticipantId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const participantId = parseUuid(rawParticipantId, "participantId");

    // 1. Verify caller is authenticated
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }

    // 2. Verify caller is Pro
    const isPro = await requirePro(user.id);
    if (!isPro) {
      throwApiError(403, "forbidden", "Pro subscription required to add guest emails");
    }

    // 3. Parse and validate request body
    let body: { email?: string; consentConfirmed?: boolean };
    try {
      body = await request.json();
    } catch {
      throwApiError(400, "validation_error", "Invalid request body");
    }

    const { email, consentConfirmed } = body;

    // Verify consent is confirmed
    if (consentConfirmed !== true) {
      throwApiError(400, "validation_error", "Consent must be confirmed");
    }

    // Validate email format
    if (!email || typeof email !== "string") {
      throwApiError(400, "validation_error", "Email is required");
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      throwApiError(400, "validation_error", "Invalid email format");
    }

    // 4. Get the tab and verify caller is creator
    const tab = await requireTab(tabId);
    if (tab.createdByUserId !== user.id) {
      throwApiError(403, "forbidden", "Only the tab owner can add guest emails");
    }

    if (tab.status === "CLOSED") {
      throwApiError(409, "tab_closed", "Cannot modify participants in a closed tab");
    }

    // 5. Get the participant and verify they belong to the tab
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: { user: true },
    });

    if (!participant || participant.tabId !== tabId) {
      throwApiError(404, "not_found", "Participant not found");
    }

    // 6. Verify participant's user doesn't already have an email (only for guests/placeholders)
    const participantUser = participant.user;
    if (participantUser.email || participantUser.authProvider !== "GUEST") {
      throwApiError(
        400,
        "validation_error",
        "This participant already has an authenticated account",
      );
    }

    // 7. Compute net balances and verify caller is OWED money by this participant
    const [participants, expenses, splits] = await Promise.all([
      prisma.participant.findMany({ where: { tabId }, select: { id: true } }),
      prisma.expense.findMany({
        where: { tabId },
        select: { id: true, paidByParticipantId: true, amountTotalCents: true },
      }),
      prisma.expenseSplit.findMany({
        where: { expense: { tabId } },
        select: { expenseId: true, participantId: true, amountCents: true },
      }),
    ]);

    const nets = computeNets(participants, expenses, splits);

    // Find caller's participant ID in this tab (to check if they're owed money)
    const callerAsParticipant = await prisma.participant.findFirst({
      where: { tabId, userId: user.id },
      select: { id: true },
    });

    const callerNet = callerAsParticipant
      ? nets.find((net) => net.participantId === callerAsParticipant.id)
      : null;
    const participantNet = nets.find((net) => net.participantId === participantId);

    // Caller is owed money if their net is positive (they paid more than they owe)
    // OR participant owes money if their net is negative (they owe more than they paid)
    // We verify: caller.net > 0 AND participant.net < 0
    if (!callerNet || !participantNet || callerNet.netCents <= 0 || participantNet.netCents >= 0) {
      throwApiError(
        400,
        "validation_error",
        "You must be owed money by this participant to add their email",
      );
    }

    // 8. Update the participant's User record
    const updatedUser = await prisma.user.update({
      where: { id: participant.userId },
      data: {
        guestEmail: normalizedEmail,
        guestEmailConsentAt: new Date(),
        guestEmailSetByUserId: user.id,
      },
    });

    return ok({
      success: true,
      participant: {
        id: participant.id,
        userId: participant.userId,
        displayName: updatedUser.displayName,
        email: updatedUser.guestEmail,
      },
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
