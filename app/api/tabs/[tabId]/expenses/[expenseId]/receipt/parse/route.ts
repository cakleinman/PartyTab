import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant, requireOpenTab } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";
import { getSupabaseServer, RECEIPTS_BUCKET } from "@/lib/supabase/client";
import { parseReceipt } from "@/lib/receipts/parser";
import { canScanReceipt } from "@/lib/auth/entitlements";
import { checkReceiptLimit, getReceiptLimit, incrementReceiptUsage } from "@/lib/billing/usage";

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
    // Authorization first — verify user can access this tab
    await requireOpenTab(tabId);
    await requireParticipant(tabId, user.id);

    // Then check scan entitlement (all authenticated users can scan)
    const canScan = await canScanReceipt(user.id);
    if (!canScan) {
      throwApiError(403, "pro_required", "Receipt parsing is not available");
    }

    // Then check usage limit based on user's plan
    try {
      const limit = await getReceiptLimit(user.id);
      await checkReceiptLimit(user.id, limit);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Receipt limit exceeded";
      throwApiError(429, "limit_exceeded", message);
    }

    // Get expense with receipt URL and tip settings
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, tabId },
      select: {
        receiptUrl: true,
        receiptTipCents: true,
        receiptTipPercent: true,
        amountTotalCents: true,
      },
    });
    if (!expense) {
      throwApiError(404, "not_found", "Expense not found");
    }
    if (!expense.receiptUrl) {
      throwApiError(400, "validation_error", "No receipt uploaded");
    }

    // Download receipt from Supabase
    const supabase = getSupabaseServer();
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .download(expense.receiptUrl);

    if (downloadError || !fileData) {
      console.error("Supabase download error:", downloadError);
      throwApiError(500, "internal_error", "Failed to download receipt");
    }

    // Convert to base64
    const buffer = await fileData.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    // Determine mime type from file extension
    const ext = expense.receiptUrl.split(".").pop()?.toLowerCase() ?? "jpg";
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      heic: "image/jpeg", // Claude doesn't support HEIC, will need conversion
    };
    const mimeType = mimeTypes[ext] ?? "image/jpeg";

    // Parse with Claude Vision
    const parsed = await parseReceipt(base64, mimeType);

    // Delete existing receipt items
    await prisma.receiptItem.deleteMany({
      where: { expenseId },
    });

    // Create new receipt items
    if (parsed.items.length > 0) {
      await prisma.receiptItem.createMany({
        data: parsed.items.map((item, index) => ({
          expenseId,
          name: item.name,
          priceCents: item.priceCents,
          quantity: item.quantity,
          sortOrder: index,
        })),
      });
    }

    // Update expense with parsed totals and amount (including tip and fees)
    const updateData: { receiptSubtotalCents?: number; receiptTaxCents?: number; receiptFeeCents?: number; receiptTipCents?: number; amountTotalCents?: number } = {};
    if (parsed.subtotalCents) {
      updateData.receiptSubtotalCents = parsed.subtotalCents;
    }
    if (parsed.taxCents) {
      updateData.receiptTaxCents = parsed.taxCents;
    }
    if (parsed.feeCents) {
      updateData.receiptFeeCents = parsed.feeCents;
    }
    // Only seed amountTotalCents on the first parse (placeholder is 0 or 1¢ from
    // the receipt-mode create flow). Re-parses leave the user-confirmed total
    // alone — otherwise tip gets double-counted when the receipt's printed
    // total already includes tip.
    const isInitialParse = (expense.amountTotalCents ?? 0) <= 1;
    if (parsed.totalCents && isInitialParse) {
      let tipCents = expense.receiptTipCents ?? 0;
      if (tipCents === 0 && expense.receiptTipPercent && expense.receiptTipPercent > 0) {
        const subtotal = parsed.subtotalCents ?? parsed.totalCents;
        tipCents = Math.round(subtotal * (expense.receiptTipPercent / 100));
        updateData.receiptTipCents = tipCents;
      }
      updateData.amountTotalCents = parsed.totalCents + tipCents;
    }
    if (Object.keys(updateData).length > 0) {
      await prisma.expense.update({
        where: { id: expenseId },
        data: updateData,
      });
    }

    // Fetch created items
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

    // Increment Usage Count
    await incrementReceiptUsage(user.id);

    const result = ok({
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
      parsed: {
        subtotalCents: parsed.subtotalCents,
        taxCents: parsed.taxCents,
        feeCents: parsed.feeCents ?? 0,
        tipCents: expense.receiptTipCents ?? 0,
        totalCents: parsed.totalCents,
        grandTotalCents: (parsed.totalCents ?? 0) + (expense.receiptTipCents ?? 0),
      },
    });
    return result;
  } catch (error) {
    if (isApiError(error)) {
      const result = apiError(error.status, error.code, error.message);
      return result;
    }
    console.error("Parse error:", error);
    const result = apiError(500, "internal_error", "Failed to parse receipt");
    return result;
  }
}
