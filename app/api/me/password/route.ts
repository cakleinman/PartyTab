import { withSimpleApiHandler } from "@/lib/api/handler";
import { throwApiError } from "@/lib/api/errors";
import { getUserFromSession } from "@/lib/api/guards";
import { ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword, hashPassword, validatePassword } from "@/lib/auth/password";

export const POST = withSimpleApiHandler(async (request) => {
  const user = await getUserFromSession();
  if (!user) {
    throwApiError(401, "unauthorized", "Unauthorized");
  }

  // Only EMAIL auth users can change password
  if (user.authProvider !== "EMAIL") {
    throwApiError(403, "forbidden", "Password change is only available for email-authenticated accounts");
  }

  const body = await request.json();
  const { currentPassword, newPassword } = body ?? {};

  if (!currentPassword || typeof currentPassword !== "string") {
    throwApiError(400, "validation_error", "Current password is required");
  }
  if (!newPassword || typeof newPassword !== "string") {
    throwApiError(400, "validation_error", "New password is required");
  }

  // Validate new password strength
  const strengthError = validatePassword(newPassword);
  if (strengthError) {
    throwApiError(400, "validation_error", strengthError);
  }

  // Verify current password
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!fullUser?.passwordHash) {
    throwApiError(400, "validation_error", "No password set on this account");
  }

  const isValid = await verifyPassword(currentPassword, fullUser.passwordHash);
  if (!isValid) {
    throwApiError(403, "forbidden", "Current password is incorrect");
  }

  // Hash and update
  const newHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return ok({ success: true });
});
