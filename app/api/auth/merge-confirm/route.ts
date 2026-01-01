import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { verifyPin, isValidPin } from "@/lib/auth/pin";
import { mergeGuestToAccount } from "@/lib/auth/merge";

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
    return NextResponse.json({ pendingMerge: null });
  }

  return NextResponse.json({ pendingMerge });
}

// POST: Verify PIN and perform merge
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const pendingMergeCookie = cookieStore.get("pending_merge")?.value;
  const pendingMerge = getPendingMerge(pendingMergeCookie);

  if (!pendingMerge) {
    return NextResponse.json({ error: "No pending merge" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { pin } = body;

  if (!pin || !isValidPin(pin)) {
    return NextResponse.json({ error: "Invalid PIN format" }, { status: 400 });
  }

  // Get the guest user and verify PIN
  const guestUser = await prisma.user.findUnique({
    where: { id: pendingMerge.guestUserId },
    select: { id: true, pinHash: true },
  });

  if (!guestUser || !guestUser.pinHash) {
    // Clear cookie and return error
    cookieStore.delete("pending_merge");
    return NextResponse.json({ error: "Guest account not found" }, { status: 404 });
  }

  // Verify PIN
  if (!verifyPin(pin, guestUser.pinHash)) {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
  }

  // PIN verified! Perform the merge
  try {
    await mergeGuestToAccount(pendingMerge.guestUserId, pendingMerge.targetUserId);
    console.log(`Merged guest user ${pendingMerge.guestUserId} into ${pendingMerge.targetUserId} after PIN verification`);

    // Clear the pending merge cookie and the guest session cookie
    cookieStore.delete("pending_merge");
    cookieStore.delete("partytab_session");

    return NextResponse.json({ success: true, message: "Accounts linked successfully" });
  } catch (error) {
    console.error("Merge failed:", error);
    return NextResponse.json({ error: "Failed to merge accounts" }, { status: 500 });
  }
}

// DELETE: Skip merge (clear pending merge cookie)
export async function DELETE() {
  const cookieStore = await cookies();

  // Clear both the pending merge cookie and the guest session
  cookieStore.delete("pending_merge");
  cookieStore.delete("partytab_session");

  return NextResponse.json({ success: true });
}
