import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant } from "@/lib/api/guards";
import { parseUuid, parseDisplayName } from "@/lib/validators/schemas";
import { computeNets } from "@/lib/settlement/computeSettlement";
import { randomBytes } from "crypto";

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
    await requireParticipant(tabId, user.id);

    const [participants, expenses, splits, claimTokens] = await Promise.all([
      prisma.participant.findMany({
        where: { tabId },
        include: { user: true },
      }),
      prisma.expense.findMany({
        where: { tabId },
        select: { id: true, paidByParticipantId: true, amountTotalCents: true },
      }),
      prisma.expenseSplit.findMany({
        where: { expense: { tabId } },
        select: { expenseId: true, participantId: true, amountCents: true },
      }),
      // Get unclaimed tokens for placeholder users
      prisma.userClaimToken.findMany({
        where: {
          claimedAt: null,
          user: {
            participants: {
              some: { tabId },
            },
          },
        },
        select: { userId: true, token: true },
      }),
    ]);

    const nets = computeNets(participants, expenses, splits);

    // Build claim token map
    const tokenMap = new Map(claimTokens.map((ct) => [ct.userId, ct.token]));
    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

    return ok({
      participants: participants.map((participant) => {
        const isPlaceholder = !participant.user.pinHash && !participant.user.googleId && !participant.user.passwordHash;
        const claimToken = tokenMap.get(participant.userId);
        return {
          id: participant.id,
          userId: participant.userId,
          displayName: participant.user.displayName,
          netCents: nets.find((net) => net.participantId === participant.id)?.netCents ?? 0,
          isPlaceholder,
          claimUrl: isPlaceholder && claimToken ? `${baseUrl}/claim/${claimToken}` : undefined,
        };
      }),
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}

/**
 * POST /api/tabs/[tabId]/participants
 * Add a placeholder participant to a tab.
 * Creates a user without PIN (placeholder) and generates a claim token.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tabId: string }> },
) {
  try {
    const { tabId: rawTabId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    await requireParticipant(tabId, user.id);

    // Check tab is active
    const tab = await prisma.tab.findUnique({
      where: { id: tabId },
      select: { status: true, name: true },
    });
    if (!tab) {
      throwApiError(404, "not_found", "Tab not found");
    }
    if (tab.status === "CLOSED") {
      throwApiError(409, "tab_closed", "Cannot add participants to a closed tab");
    }

    const body = await request.json();
    const displayName = parseDisplayName(body?.displayName);

    // Create placeholder user (no PIN, authProvider = GUEST)
    const placeholderUser = await prisma.user.create({
      data: {
        displayName,
        authProvider: "GUEST",
        // No pinHash = unclaimed placeholder
      },
    });

    // Create participant
    const participant = await prisma.participant.create({
      data: {
        tabId,
        userId: placeholderUser.id,
      },
    });

    // Generate claim token
    const token = randomBytes(32).toString("hex");
    await prisma.userClaimToken.create({
      data: {
        userId: placeholderUser.id,
        token,
      },
    });

    // Build claim URL
    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
    const claimUrl = `${baseUrl}/claim/${token}`;

    return ok({
      participant: {
        id: participant.id,
        userId: placeholderUser.id,
        displayName: placeholderUser.displayName,
        netCents: 0,
        isPlaceholder: true,
      },
      claimUrl,
      claimToken: token,
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
