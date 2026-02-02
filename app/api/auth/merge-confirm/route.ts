import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { verifyPin, isValidPin } from "@/lib/auth/pin";
import { mergeGuestToAccount } from "@/lib/auth/merge";
import { ok, error as apiError } from "@/lib/api/response";

type PendingMerge = {
  guestUserId: string;
  guestDisplayName: string;
  targetUserId: string;
};

function getPendingMerge(cookieValue: string | undefined): PendingMerge | null {
  if (!cookieValue) return null;
  try {
    const parsed = JSON.parse(cookieValue);
    if (parsed.guestUserId && parsed.guestDisplayName && parsed.targetUserId) {
      return parsed as PendingMerge;
    }
    return null;
  } catch {
    return null;
  }
}

// GET: Check if there's a pending merge
export async function GET() {
  const cookieStore = await cookies();
  const pendingMergeCookie = cookieStore.get("pending_merge")?.value;
  const pendingMerge = getPendingMerge(pendingMergeCookie);

  if (!pendingMerge) {
    return ok({ pendingMerge: null });
  }

  return ok({ pendingMerge });
}

// POST: Verify PIN and perform merge
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const pendingMergeCookie = cookieStore.get("pending_merge")?.value;
  const pendingMerge = getPendingMerge(pendingMergeCookie);

  if (!pendingMerge) {
    return apiError(400, "validation_error", "No pending merge");
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "validation_error", "Invalid request body");
  }

  const { pin } = body;

  if (!pin || !isValidPin(pin)) {
    return apiError(400, "validation_error", "Invalid PIN format");
  }

  // Get the guest user and verify PIN
  const guestUser = await prisma.user.findUnique({
    where: { id: pendingMerge.guestUserId },
    select: { id: true, pinHash: true },
  });

  if (!guestUser || !guestUser.pinHash) {
    // Clear cookie and return error
    cookieStore.delete("pending_merge");
    return apiError(404, "not_found", "Guest account not found");
  }

  // Verify PIN
  if (!await verifyPin(pin, guestUser.pinHash)) {
    return apiError(401, "unauthorized", "Incorrect PIN");
  }

  // PIN verified! Perform the merge
  try {
    await mergeGuestToAccount(pendingMerge.guestUserId, pendingMerge.targetUserId);
    console.log(`Merged guest user ${pendingMerge.guestUserId} into ${pendingMerge.targetUserId} after PIN verification`);

    // Clear the pending merge cookie and the guest session cookie
    cookieStore.delete("pending_merge");
    cookieStore.delete("partytab_session");

    return ok({ success: true, message: "Accounts linked successfully" });
  } catch (err) {
    console.error("Merge failed:", err);
    return apiError(500, "internal_error", "Failed to merge accounts");
  }
}

// DELETE: Skip merge (clear pending merge cookie)
export async function DELETE() {
  const cookieStore = await cookies();

  // Clear both the pending merge cookie and the guest session
  cookieStore.delete("pending_merge");
  cookieStore.delete("partytab_session");

  return ok({ success: true });
}
