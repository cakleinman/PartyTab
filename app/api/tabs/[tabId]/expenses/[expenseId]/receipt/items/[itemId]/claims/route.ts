import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, created, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant, requireOpenTab, checkApiRateLimit, logApiResponse } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tabId: string; expenseId: string; itemId: string }> }
) {
  const startTime = Date.now();
  try {
    const { tabId: rawTabId, expenseId: rawExpenseId, itemId: rawItemId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const expenseId = parseUuid(rawExpenseId, "expenseId");
    const itemId = parseUuid(rawItemId, "itemId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    const { response: rateLimitResponse } = await checkApiRateLimit(request, user.id);
    if (rateLimitResponse) return rateLimitResponse;
    await requireOpenTab(tabId);
    await requireParticipant(tabId, user.id);

    const body = await request.json();
    const participantId = parseUuid(body?.participantId, "participantId");

    // Verify item exists and belongs to expense
    const item = await prisma.receiptItem.findFirst({
      where: { id: itemId, expenseId },
      include: { expense: { select: { tabId: true } } },
    });
    if (!item || item.expense.tabId !== tabId) {
      throwApiError(404, "not_found", "Item not found");
    }

    // Verify participant is in the tab
    const participant = await prisma.participant.findFirst({
      where: { id: participantId, tabId },
    });
    if (!participant) {
      throwApiError(400, "validation_error", "Participant not in tab");
    }

    // Check if claim already exists
    const existingClaim = await prisma.receiptItemClaim.findUnique({
      where: {
        receiptItemId_participantId: {
          receiptItemId: itemId,
          participantId,
        },
      },
    });
    if (existingClaim) {
      const result = ok({ message: "Already claimed" });
      logApiResponse(request, user.id, result.status, startTime);
      return result;
    }

    // Create claim
    await prisma.receiptItemClaim.create({
      data: {
        receiptItemId: itemId,
        participantId,
      },
    });

    // Return updated item
    const updated = await prisma.receiptItem.findUnique({
      where: { id: itemId },
      include: {
        claims: {
          include: {
            participant: {
              include: {
                user: {
                  select: { displayName: true },
                },
              },
            },
          },
        },
      },
    });

    const result = created({
      item: {
        id: updated!.id,
        name: updated!.name,
        priceCents: updated!.priceCents,
        quantity: updated!.quantity,
        claimedBy: updated!.claims.map((claim) => ({
          participantId: claim.participantId,
          displayName: claim.participant.user.displayName,
        })),
      },
    });
    logApiResponse(request, user.id, result.status, startTime);
    return result;
  } catch (error) {
    if (isApiError(error)) {
      const result = apiError(error.status, error.code, error.message);
      logApiResponse(request, null, result.status, startTime);
      return result;
    }
    const result = validationError(error);
    logApiResponse(request, null, result.status, startTime);
    return result;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tabId: string; expenseId: string; itemId: string }> }
) {
  const startTime = Date.now();
  try {
    const { tabId: rawTabId, expenseId: rawExpenseId, itemId: rawItemId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const expenseId = parseUuid(rawExpenseId, "expenseId");
    const itemId = parseUuid(rawItemId, "itemId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    const { response: rateLimitResponse } = await checkApiRateLimit(request, user.id);
    if (rateLimitResponse) return rateLimitResponse;
    await requireOpenTab(tabId);
    await requireParticipant(tabId, user.id);

    const body = await request.json();
    const participantId = parseUuid(body?.participantId, "participantId");

    // Verify item exists and belongs to expense
    const item = await prisma.receiptItem.findFirst({
      where: { id: itemId, expenseId },
      include: { expense: { select: { tabId: true } } },
    });
    if (!item || item.expense.tabId !== tabId) {
      throwApiError(404, "not_found", "Item not found");
    }

    // Delete claim if exists
    await prisma.receiptItemClaim.deleteMany({
      where: {
        receiptItemId: itemId,
        participantId,
      },
    });

    // Return updated item
    const updated = await prisma.receiptItem.findUnique({
      where: { id: itemId },
      include: {
        claims: {
          include: {
            participant: {
              include: {
                user: {
                  select: { displayName: true },
                },
              },
            },
          },
        },
      },
    });

    const result = ok({
      item: {
        id: updated!.id,
        name: updated!.name,
        priceCents: updated!.priceCents,
        quantity: updated!.quantity,
        claimedBy: updated!.claims.map((claim) => ({
          participantId: claim.participantId,
          displayName: claim.participant.user.displayName,
        })),
      },
    });
    logApiResponse(request, user.id, result.status, startTime);
    return result;
  } catch (error) {
    if (isApiError(error)) {
      const result = apiError(error.status, error.code, error.message);
      logApiResponse(request, null, result.status, startTime);
      return result;
    }
    const result = validationError(error);
    logApiResponse(request, null, result.status, startTime);
    return result;
  }
}
