import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant, requireOpenTab } from "@/lib/api/guards";
import { parseAmountToCents, parseDateInput, parseOptionalString, parseUuid } from "@/lib/validators/schemas";
import { parseSplits } from "@/lib/validators/splits";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tabId: string; expenseId: string }> },
) {
  try {
    const { tabId: rawTabId, expenseId: rawExpenseId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const expenseId = parseUuid(rawExpenseId, "expenseId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    await requireParticipant(tabId, user.id);

    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, tabId },
      include: { splits: true },
    });
    if (!expense) {
      throwApiError(404, "not_found", "Expense not found");
    }

    return ok({
      expense: {
        id: expense.id,
        amountTotalCents: expense.amountTotalCents,
        note: expense.note,
        date: expense.date.toISOString().slice(0, 10),
        paidByParticipantId: expense.paidByParticipantId,
        createdByUserId: expense.createdByUserId,
        createdAt: expense.createdAt.toISOString(),
        receiptSubtotalCents: expense.receiptSubtotalCents,
        receiptTaxCents: expense.receiptTaxCents,
        receiptFeeCents: expense.receiptFeeCents,
        receiptTipCents: expense.receiptTipCents,
        receiptTipPercent: expense.receiptTipPercent,
        splits: expense.splits.map((split) => ({
          participantId: split.participantId,
          amountCents: split.amountCents,
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tabId: string; expenseId: string }> },
) {
  try {
    const { tabId: rawTabId, expenseId: rawExpenseId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const expenseId = parseUuid(rawExpenseId, "expenseId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    const tab = await requireOpenTab(tabId);
    await requireParticipant(tabId, user.id);

    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, tabId },
      include: { splits: true },
    });
    if (!expense) {
      throwApiError(404, "not_found", "Expense not found");
    }
    // Allow edit by expense creator or tab owner
    if (expense.createdByUserId !== user.id && tab.createdByUserId !== user.id) {
      throwApiError(403, "forbidden", "Only the expense creator or tab owner can edit this expense");
    }

    const body = await request.json();
    const amountTotalCents = body?.amount ? parseAmountToCents(body.amount) : expense.amountTotalCents;
    const note = body?.note !== undefined ? parseOptionalString(body.note, 240) : expense.note;
    const date = body?.date ? parseDateInput(body.date) ?? expense.date : expense.date;
    const paidByParticipantId = parseUuid(body?.paidByParticipantId ?? expense.paidByParticipantId, "paidByParticipantId");

    // Handle tip fields
    let receiptTipCents: number | null = expense.receiptTipCents;
    let receiptTipPercent: number | null = expense.receiptTipPercent;

    if (body?.tipMode === "amount" && body?.tipValue !== undefined) {
      const tipValue = parseFloat(body.tipValue);
      if (!isNaN(tipValue) && tipValue >= 0) {
        receiptTipCents = Math.round(tipValue * 100);
        receiptTipPercent = null;
      }
    } else if (body?.tipMode === "percent" && body?.tipValue !== undefined) {
      const tipPercent = parseFloat(body.tipValue);
      if (!isNaN(tipPercent) && tipPercent >= 0) {
        receiptTipPercent = tipPercent;
        // Calculate tip cents from subtotal
        const subtotal = expense.receiptSubtotalCents ?? 0;
        receiptTipCents = Math.round(subtotal * (tipPercent / 100));
      }
    } else if (body?.tipCents !== undefined) {
      // Direct tip cents (backwards compatibility)
      receiptTipCents = typeof body.tipCents === "number" ? body.tipCents : null;
    }

    const participants = await prisma.participant.findMany({
      where: { tabId },
      select: { id: true },
    });
    const participantIds = participants.map((p) => p.id);

    if (!participantIds.includes(paidByParticipantId)) {
      throwApiError(400, "validation_error", "Paid by participant must be in tab");
    }

    const splits = body?.splits || body?.evenSplit
      ? parseSplits(body, amountTotalCents, participantIds)
      : expense.splits.map((split) => ({
          participantId: split.participantId,
          amountCents: split.amountCents,
        }));

    const updated = await prisma.$transaction(async (tx) => {
      await tx.expenseSplit.deleteMany({ where: { expenseId } });
      return tx.expense.update({
        where: { id: expenseId },
        data: {
          amountTotalCents,
          note,
          date,
          paidByParticipantId,
          receiptTipCents,
          receiptTipPercent,
          splits: {
            create: splits.map((split) => ({
              participantId: split.participantId,
              amountCents: split.amountCents,
            })),
          },
        },
      });
    });

    return ok({
      expense: {
        id: updated.id,
        amountTotalCents: updated.amountTotalCents,
        note: updated.note,
        date: updated.date.toISOString().slice(0, 10),
        paidByParticipantId: updated.paidByParticipantId,
        createdAt: updated.createdAt.toISOString(),
        receiptTipCents: updated.receiptTipCents,
        receiptTipPercent: updated.receiptTipPercent,
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
  { params }: { params: Promise<{ tabId: string; expenseId: string }> },
) {
  try {
    const { tabId: rawTabId, expenseId: rawExpenseId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const expenseId = parseUuid(rawExpenseId, "expenseId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    const tab = await requireOpenTab(tabId);
    await requireParticipant(tabId, user.id);

    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, tabId },
    });
    if (!expense) {
      throwApiError(404, "not_found", "Expense not found");
    }

    // Allow deletion by expense creator or tab owner
    if (expense.createdByUserId !== user.id && tab.createdByUserId !== user.id) {
      throwApiError(403, "forbidden", "Only the expense creator or tab owner can delete this expense");
    }

    // Delete splits first, then expense
    await prisma.$transaction(async (tx) => {
      await tx.expenseSplit.deleteMany({ where: { expenseId } });
      await tx.expense.delete({ where: { id: expenseId } });
    });

    return ok({ deleted: true });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
