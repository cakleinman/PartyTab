import { prisma } from "@/lib/db/prisma";
import { created, error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant, requireOpenTab, checkApiRateLimit, logApiResponse } from "@/lib/api/guards";
import { parseAmountToCents, parseDateInput, parseOptionalString, parseUuid } from "@/lib/validators/schemas";
import { parseSplits } from "@/lib/validators/splits";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tabId: string }> },
) {
  const startTime = Date.now();
  try {
    const { tabId: rawTabId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    const { response: rateLimitResponse } = await checkApiRateLimit(request, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    await requireParticipant(tabId, user.id);

    const expenses = await prisma.expense.findMany({
      where: { tabId },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        id: true,
        amountTotalCents: true,
        note: true,
        date: true,
        isEstimate: true,
        paidByParticipantId: true,
        createdAt: true,
        paidBy: {
          select: {
            id: true,
            user: {
              select: { displayName: true },
            },
          },
        },
        splits: {
          select: {
            participantId: true,
            amountCents: true,
            participant: {
              select: {
                id: true,
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
      expenses: expenses.map((expense) => ({
        id: expense.id,
        amountTotalCents: expense.amountTotalCents,
        note: expense.note,
        date: expense.date.toISOString().slice(0, 10),
        isEstimate: expense.isEstimate,
        paidByParticipantId: expense.paidByParticipantId,
        paidByName: expense.paidBy.user.displayName,
        createdAt: expense.createdAt.toISOString(),
        splits: expense.splits.map((split) => ({
          participantId: split.participantId,
          participantName: split.participant.user.displayName,
          amountCents: split.amountCents,
        })),
      })),
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tabId: string }> },
) {
  const startTime = Date.now();
  try {
    const { tabId: rawTabId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    const { response: rateLimitResponse } = await checkApiRateLimit(request, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    await requireOpenTab(tabId);

    const participant = await requireParticipant(tabId, user.id);
    const body = await request.json();
    const note = parseOptionalString(body?.note, 240);
    const date = parseDateInput(body?.date) ?? new Date();
    const paidByParticipantId = parseUuid(body?.paidByParticipantId ?? participant.id, "paidByParticipantId");
    const isEstimate = body?.isEstimate === true;

    // Receipt mode: amount can be 0/empty, tip is stored for later calculation
    const isReceiptMode = body?.receiptMode === true;
    const tipCents = typeof body?.tipCents === "number" && body.tipCents >= 0 ? Math.round(body.tipCents) : null;
    const tipPercent = typeof body?.tipPercent === "number" && body.tipPercent >= 0 ? body.tipPercent : null;

    // Amount is required unless in receipt mode (will be populated after parsing)
    let amountTotalCents: number;
    if (isReceiptMode && (!body?.amount || body.amount === "0" || body.amount === "")) {
      amountTotalCents = 0; // Placeholder, will be updated after receipt parsing
    } else {
      amountTotalCents = parseAmountToCents(body?.amount);
    }

    const participants = await prisma.participant.findMany({
      where: { tabId },
      select: { id: true },
    });
    const participantIds = participants.map((p) => p.id);

    if (!participantIds.includes(paidByParticipantId)) {
      throwApiError(400, "validation_error", "Paid by participant must be in tab");
    }

    // For receipt mode, create even split across all participants as placeholder
    const splits = isReceiptMode && amountTotalCents === 0
      ? participantIds.map(id => ({ participantId: id, amountCents: 0 }))
      : parseSplits(body, amountTotalCents, participantIds);

    const expense = await prisma.expense.create({
      data: {
        tabId,
        amountTotalCents,
        note,
        date,
        isEstimate,
        paidByParticipantId,
        createdByUserId: user.id,
        receiptTipCents: tipCents,
        receiptTipPercent: tipPercent,
        splits: {
          create: splits.map((split) => ({
            participantId: split.participantId,
            amountCents: split.amountCents,
          })),
        },
      },
    });

    const result = created({
      expense: {
        id: expense.id,
        amountTotalCents: expense.amountTotalCents,
        note: expense.note,
        date: expense.date.toISOString().slice(0, 10),
        isEstimate: expense.isEstimate,
        paidByParticipantId: expense.paidByParticipantId,
        createdAt: expense.createdAt.toISOString(),
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
