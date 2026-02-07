import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, created, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant, requireOpenTab } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tabId: string; expenseId: string; itemId: string }> }
) {
  try {
    const { tabId: rawTabId, expenseId: rawExpenseId, itemId: rawItemId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const expenseId = parseUuid(rawExpenseId, "expenseId");
    const itemId = parseUuid(rawItemId, "itemId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
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
      return ok({ message: "Already claimed" });
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

    return created({
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
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tabId: string; expenseId: string; itemId: string }> }
) {
  try {
    const { tabId: rawTabId, expenseId: rawExpenseId, itemId: rawItemId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const expenseId = parseUuid(rawExpenseId, "expenseId");
    const itemId = parseUuid(rawItemId, "itemId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
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

    return ok({
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
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
