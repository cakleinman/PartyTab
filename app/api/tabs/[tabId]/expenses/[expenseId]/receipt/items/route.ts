import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, created, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant, requireTab } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tabId: string; expenseId: string }> }
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
    });
    if (!expense) {
      throwApiError(404, "not_found", "Expense not found");
    }

    const items = await prisma.receiptItem.findMany({
      where: { expenseId },
      orderBy: { sortOrder: "asc" },
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
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        priceCents: item.priceCents,
        quantity: item.quantity,
        claimedBy: item.claims.map((claim) => ({
          participantId: claim.participantId,
          displayName: claim.participant.user.displayName,
        })),
      })),
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tabId: string; expenseId: string }> }
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
    });
    if (!expense) {
      throwApiError(404, "not_found", "Expense not found");
    }

    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 100) : "";
    const priceCents = typeof body?.priceCents === "number" ? Math.round(body.priceCents) : 0;
    const quantity = typeof body?.quantity === "number" && body.quantity > 0 ? body.quantity : 1;

    if (!name) {
      throwApiError(400, "validation_error", "Item name is required");
    }
    if (priceCents <= 0) {
      throwApiError(400, "validation_error", "Price must be greater than zero");
    }

    // Get max sort order
    const maxOrder = await prisma.receiptItem.aggregate({
      where: { expenseId },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const item = await prisma.receiptItem.create({
      data: {
        expenseId,
        name,
        priceCents,
        quantity,
        sortOrder,
      },
    });

    return created({
      item: {
        id: item.id,
        name: item.name,
        priceCents: item.priceCents,
        quantity: item.quantity,
        claimedBy: [],
      },
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
