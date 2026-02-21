import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant, requireOpenTab } from "@/lib/api/guards";
import { canScanReceipt } from "@/lib/auth/entitlements";
import { parseUuid } from "@/lib/validators/schemas";
import {
  getSupabaseServer,
  RECEIPTS_BUCKET,
  getReceiptPath,
  getReceiptSignedUrl,
} from "@/lib/supabase/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
  };
  return map[mimeType] ?? "jpg";
}

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
      select: { receiptUrl: true },
    });
    if (!expense) {
      throwApiError(404, "not_found", "Expense not found");
    }

    if (!expense.receiptUrl) {
      return ok({ receipt: null });
    }

    const signedUrl = await getReceiptSignedUrl(expense.receiptUrl);
    return ok({
      receipt: {
        path: expense.receiptUrl,
        url: signedUrl,
      },
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
    await requireOpenTab(tabId);
    await requireParticipant(tabId, user.id);

    // All authenticated users can upload receipts (quota checked at parse time)
    const canScan = await canScanReceipt(user.id);
    if (!canScan) {
      throwApiError(403, "pro_required", "Receipt uploads are not available");
    }

    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, tabId },
    });
    if (!expense) {
      throwApiError(404, "not_found", "Expense not found");
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throwApiError(400, "validation_error", "No file provided");
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throwApiError(
        400,
        "validation_error",
        "Invalid file type. Allowed: JPEG, PNG, WebP, HEIC"
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throwApiError(400, "validation_error", "File too large. Max size: 10MB");
    }

    const supabase = getSupabaseServer();
    const ext = getExtension(file.type);
    const path = getReceiptPath(tabId, expenseId, ext);

    // Delete old receipt if exists
    if (expense.receiptUrl) {
      await supabase.storage.from(RECEIPTS_BUCKET).remove([expense.receiptUrl]);
    }

    // Upload new receipt
    const buffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throwApiError(500, "internal_error", "Failed to upload receipt");
    }

    // Update expense with receipt URL
    await prisma.expense.update({
      where: { id: expenseId },
      data: { receiptUrl: path },
    });

    const signedUrl = await getReceiptSignedUrl(path);

    return ok({
      receipt: {
        path,
        url: signedUrl,
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
    await requireOpenTab(tabId);
    await requireParticipant(tabId, user.id);

    // All authenticated users can delete their uploaded receipts
    const canScan = await canScanReceipt(user.id);
    if (!canScan) {
      throwApiError(403, "pro_required", "Receipt management is not available");
    }

    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, tabId },
    });
    if (!expense) {
      throwApiError(404, "not_found", "Expense not found");
    }

    if (!expense.receiptUrl) {
      return ok({ deleted: true });
    }

    // Delete from Supabase Storage
    const supabase = getSupabaseServer();
    const { error: deleteError } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .remove([expense.receiptUrl]);

    if (deleteError) {
      console.error("Supabase delete error:", deleteError);
      // Continue anyway - file might already be deleted
    }

    // Also delete any parsed receipt items
    await prisma.receiptItem.deleteMany({
      where: { expenseId },
    });

    // Clear receipt URL from expense
    await prisma.expense.update({
      where: { id: expenseId },
      data: { receiptUrl: null },
    });

    return ok({ deleted: true });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
