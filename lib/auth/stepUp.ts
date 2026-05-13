import { prisma } from "@/lib/db/prisma";
import { throwApiError } from "@/lib/api/errors";
import { verifyPassword } from "@/lib/auth/password";

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
 *   - GOOGLE users: allowed through. They have no password to confirm and
 *     re-authenticating via Google would be its own UX project. Status quo
 *     matches the pre-change behaviour for them. Once a passkey-assertion
 *     step-up cookie is implemented (Phase 5 follow-up), Google users with
 *     an enrolled passkey will be required to satisfy it here.
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
  // authProvider is unused for now — kept in the signature so callers don't
  // need to change when the passkey-step-up bridge ships.
  void authProvider;

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

  // Google users (or any other account with no passwordHash) fall through.
  // Tracked: once a recent-passkey-assertion cookie exists, require it here
  // for users with at least one enrolled passkey.
}
