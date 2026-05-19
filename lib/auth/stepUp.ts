import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { throwApiError } from "@/lib/api/errors";
import { verifyPassword } from "@/lib/auth/password";
import { STEP_UP_COOKIE, STEP_UP_TTL_MS, parseStepUp } from "@/lib/auth/stepUpCookie";

/**
 * Step-up re-authentication for sensitive mutations.
 *
 * A valid session is necessary but not sufficient for actions an attacker
 * would exploit via cookie theft — currently used by payment-method
 * mutations, where a stolen session could redirect Venmo links to the
 * attacker's account.
 *
 * Branching by auth provider:
 *   - EMAIL users: must submit currentPassword; verified against the hash.
 *   - GOOGLE users: must present a fresh partytab_stepup cookie set by
 *     /api/auth/stepup/google/complete after a Google OAuth re-prompt.
 *     Throws 412 step_up_required with details.method="google_oauth" when
 *     missing/expired so the client can render the re-auth banner.
 *   - GUEST users: callers should reject these before reaching here.
 *
 * Throws ApiError on failure; returns void on success.
 */
export async function requireStepUp(params: {
  userId: string;
  authProvider: string;
  currentPassword: string | null;
}): Promise<void> {
  const { userId, authProvider, currentPassword } = params;

  const fullUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (fullUser?.passwordHash) {
    if (!currentPassword) {
      throwApiError(401, "unauthorized", "Password confirmation required");
    }
    const passwordOk = await verifyPassword(currentPassword, fullUser.passwordHash);
    if (!passwordOk) {
      throwApiError(403, "forbidden", "Current password is incorrect");
    }
    return;
  }

  if (authProvider === "GOOGLE") {
    const cookieStore = await cookies();
    const raw = cookieStore.get(STEP_UP_COOKIE)?.value;
    const payload = parseStepUp(raw);
    if (
      payload &&
      payload.userId === userId &&
      Date.now() - payload.iat < STEP_UP_TTL_MS
    ) {
      return;
    }
    throwApiError(
      412,
      "step_up_required",
      "Confirm with Google to change payment methods",
      { method: "google_oauth" },
    );
  }

  // Guests are rejected upstream; any other unexpected provider falls
  // through silently to preserve historical behaviour.
}
