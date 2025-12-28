import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant, requireTab } from "@/lib/api/guards";
import { parseAmountToCents, parseDateInput, parseOptionalString, parseUuid } from "@/lib/validators/schemas";
import { distributeEvenSplit } from "@/lib/money/cents";

interface Split {
  participantId: string;
  amountCents: number;
}

function parseSplits(
  body: Record<string, unknown>,
  amountTotalCents: number,
  participantIds: string[],
): Split[] {
  if (body?.evenSplit) {
    const targetIds = Array.isArray(body?.splitParticipantIds) && body.splitParticipantIds.length
      ? body.splitParticipantIds.map((id: string) => parseUuid(id, "participantId"))
      : participantIds;
    const uniqueIds = new Set<string>();
    targetIds.forEach((participantId: string) => {
      if (!participantIds.includes(participantId)) {
        throwApiError(400, "validation_error", "Split participant must be in tab");
      }
      if (uniqueIds.has(participantId)) {
        throwApiError(400, "validation_error", "Split participants must be unique");
      }
      uniqueIds.add(participantId);
    });
    if (uniqueIds.size === 0) {
      throwApiError(400, "validation_error", "Split participants are required");
    }
    return distributeEvenSplit(amountTotalCents, targetIds);
  }

  if (!Array.isArray(body?.splits) || body.splits.length === 0) {
    throwApiError(400, "validation_error", "Splits are required");
  }

  const seen = new Set<string>();
  const rawSplits = body.splits as Array<{ participantId?: string; amountCents?: number }>;
  const splits = rawSplits.map((split) => {
    if (!split?.participantId || typeof split?.amountCents !== "number") {
      throwApiError(400, "validation_error", "Invalid split format");
    }
    const participantId = parseUuid(split.participantId, "participantId");
    if (!participantIds.includes(participantId)) {
      throwApiError(400, "validation_error", "Split participant must be in tab");
    }
    if (!Number.isInteger(split.amountCents) || split.amountCents <= 0) {
      throwApiError(400, "validation_error", "Split amount must be greater than zero");
    }
    if (seen.has(participantId)) {
      throwApiError(400, "validation_error", "Split participants must be unique");
    }
    seen.add(participantId);
    return { participantId, amountCents: split.amountCents };
  });

  const sum = splits.reduce((total, split) => total + split.amountCents, 0);
  if (sum !== amountTotalCents) {
    throwApiError(400, "validation_error", "Split amounts must equal total");
  }
  return splits;
}

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
    const tab = await requireTab(tabId);
    if (tab.status === "CLOSED") {
      throwApiError(409, "tab_closed", "Tab is closed");
    }
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
    const tab = await requireTab(tabId);
    if (tab.status === "CLOSED") {
      throwApiError(409, "tab_closed", "Cannot delete expenses from a closed tab");
    }
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
