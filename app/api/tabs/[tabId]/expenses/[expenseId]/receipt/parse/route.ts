import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant, requireOpenTab } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";
import { getSupabaseServer, RECEIPTS_BUCKET } from "@/lib/supabase/client";
import { parseReceipt } from "@/lib/receipts/parser";
import { canUseProFeatures } from "@/lib/auth/entitlements";
import { checkReceiptLimit, incrementReceiptUsage } from "@/lib/billing/usage";

export async function POST(
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

    // Check Pro Entitlement
    const isPro = await canUseProFeatures(user.id);
    if (!isPro) {
      throwApiError(403, "pro_required", "Pro subscription required for receipt parsing");
    }

    // Check Usage Limit
    try {
      await checkReceiptLimit(user.id);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Receipt limit exceeded";
      throwApiError(429, "limit_exceeded", message);
    }

    await requireOpenTab(tabId);
    await requireParticipant(tabId, user.id);

    // Get expense with receipt URL and tip settings
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, tabId },
      select: { receiptUrl: true, receiptTipCents: true, receiptTipPercent: true },
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
    if (parsed.totalCents) {
      // Calculate tip: use fixed cents if set, otherwise calculate from percentage
      let tipCents = expense.receiptTipCents ?? 0;
      if (tipCents === 0 && expense.receiptTipPercent && expense.receiptTipPercent > 0) {
        // Calculate tip from percentage of receipt total (before tip)
        tipCents = Math.round(parsed.totalCents * (expense.receiptTipPercent / 100));
        updateData.receiptTipCents = tipCents;
      }
      // Total = parsed total + tip (fees are already in parsed total)
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
      parsed: {
        subtotalCents: parsed.subtotalCents,
        taxCents: parsed.taxCents,
        feeCents: parsed.feeCents ?? 0,
        tipCents: expense.receiptTipCents ?? 0,
        totalCents: parsed.totalCents,
        grandTotalCents: (parsed.totalCents ?? 0) + (expense.receiptTipCents ?? 0),
      },
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    console.error("Parse error:", error);
    // Extract meaningful error message
    const message = error instanceof Error ? error.message : "Failed to parse receipt";
    return apiError(500, "internal_error", message);
  }
}
