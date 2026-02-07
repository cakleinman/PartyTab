import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant, requireOpenTab } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";

export async function PATCH(
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

    const item = await prisma.receiptItem.findFirst({
      where: { id: itemId, expenseId },
      include: { expense: { select: { tabId: true } } },
    });
    if (!item || item.expense.tabId !== tabId) {
      throwApiError(404, "not_found", "Item not found");
    }

    const body = await request.json();
    const updates: { name?: string; priceCents?: number; quantity?: number } = {};

    if (typeof body?.name === "string") {
      const name = body.name.trim().slice(0, 100);
      if (!name) {
        throwApiError(400, "validation_error", "Item name cannot be empty");
      }
      updates.name = name;
    }
    if (typeof body?.priceCents === "number") {
      if (body.priceCents <= 0) {
        throwApiError(400, "validation_error", "Price must be greater than zero");
      }
      updates.priceCents = Math.round(body.priceCents);
    }
    if (typeof body?.quantity === "number") {
      if (body.quantity <= 0) {
        throwApiError(400, "validation_error", "Quantity must be greater than zero");
      }
      updates.quantity = body.quantity;
    }

    const updated = await prisma.receiptItem.update({
      where: { id: itemId },
      data: updates,
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
        id: updated.id,
        name: updated.name,
        priceCents: updated.priceCents,
        quantity: updated.quantity,
        claimedBy: updated.claims.map((claim) => ({
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
  _request: Request,
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

    const item = await prisma.receiptItem.findFirst({
      where: { id: itemId, expenseId },
      include: { expense: { select: { tabId: true } } },
    });
    if (!item || item.expense.tabId !== tabId) {
      throwApiError(404, "not_found", "Item not found");
    }

    await prisma.receiptItem.delete({
      where: { id: itemId },
    });

    return ok({ deleted: true });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
