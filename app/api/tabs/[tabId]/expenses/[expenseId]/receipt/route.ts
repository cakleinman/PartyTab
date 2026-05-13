import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant, requireOpenTab, checkApiRateLimit, logApiResponse } from "@/lib/api/guards";
import { canScanReceipt } from "@/lib/auth/entitlements";
import { parseUuid } from "@/lib/validators/schemas";
import {
  ALLOWED_RECEIPT_MIME_TYPES,
  verifyImageMagicBytes,
} from "@/lib/receipts/verifyImageMagicBytes";
import {
  getSupabaseServer,
  RECEIPTS_BUCKET,
  getReceiptPath,
  getReceiptSignedUrl,
} from "@/lib/supabase/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES: readonly string[] = ALLOWED_RECEIPT_MIME_TYPES;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tabId: string; expenseId: string }> }
) {
  const startTime = Date.now();
  try {
    const { tabId: rawTabId, expenseId: rawExpenseId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const expenseId = parseUuid(rawExpenseId, "expenseId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    const { response: rateLimitResponse } = await checkApiRateLimit(request, user.id);
    if (rateLimitResponse) return rateLimitResponse;
    await requireParticipant(tabId, user.id);

    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, tabId },
      select: { receiptUrl: true },
    });
    if (!expense) {
      throwApiError(404, "not_found", "Expense not found");
    }

    if (!expense.receiptUrl) {
      const result = ok({ receipt: null });
      logApiResponse(request, user.id, result.status, startTime);
      return result;
    }

    const signedUrl = await getReceiptSignedUrl(expense.receiptUrl);
    const result = ok({
      receipt: {
        path: expense.receiptUrl,
        url: signedUrl,
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tabId: string; expenseId: string }> }
) {
  const startTime = Date.now();
  try {
    const { tabId: rawTabId, expenseId: rawExpenseId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const expenseId = parseUuid(rawExpenseId, "expenseId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    const { response: rateLimitResponse } = await checkApiRateLimit(request, user.id);
    if (rateLimitResponse) return rateLimitResponse;
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

    // Magic-byte verification: the client-supplied file.type can be spoofed,
    // so detect the true format from the buffer header before storing.
    const buffer = Buffer.from(await file.arrayBuffer());
    const magic = await verifyImageMagicBytes(buffer);
    if (!magic.ok) {
      throwApiError(
        415,
        "validation_error",
        "File contents do not match an allowed image type"
      );
    }

    const supabase = getSupabaseServer();
    const path = getReceiptPath(tabId, expenseId, magic.ext);

    // Delete old receipt if exists
    if (expense.receiptUrl) {
      await supabase.storage.from(RECEIPTS_BUCKET).remove([expense.receiptUrl]);
    }

    // Upload new receipt using the detected (not client-claimed) content type.
    const { error: uploadError } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .upload(path, buffer, {
        contentType: magic.mime,
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

    const result = ok({
      receipt: {
        path,
        url: signedUrl,
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
  { params }: { params: Promise<{ tabId: string; expenseId: string }> }
) {
  const startTime = Date.now();
  try {
    const { tabId: rawTabId, expenseId: rawExpenseId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const expenseId = parseUuid(rawExpenseId, "expenseId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    const { response: rateLimitResponse } = await checkApiRateLimit(request, user.id);
    if (rateLimitResponse) return rateLimitResponse;
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
      const result = ok({ deleted: true });
      logApiResponse(request, user.id, result.status, startTime);
      return result;
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

    const result = ok({ deleted: true });
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
