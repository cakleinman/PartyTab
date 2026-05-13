import { prisma } from "@/lib/db/prisma";
import { throwApiError } from "@/lib/api/errors";
import { verifyPassword } from "@/lib/auth/password";

/**
 * Step-up re-authentication for sensitive mutations.
 *
 * A valid session is necessary but not sufficient for actions that an
 * attacker would exploit via cookie theft — currently used by payment-method
 * mutations, where a stolen session could redirect Venmo links to the
 * attacker's account.
 *
 * Branching by auth provider:
 *   - EMAIL users: must submit currentPassword; verified against the hash.
 *   - GOOGLE users: blocked with `step_up_required` (412) until passkey
 *     enrolment lands. Silently allowing them would make the audit narrative
 *     dishonest (the attack the step-up exists to prevent applies equally).
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
    throwApiError(
      412,
      "step_up_required",
      "Enrol a passkey to change payment methods on a Google-linked account",
    );
  }
}
