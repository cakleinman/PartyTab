import { withApiHandler } from "@/lib/api/handler";
import { throwApiError } from "@/lib/api/errors";
import { getUserFromSession } from "@/lib/api/guards";
import { noContent } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { requireStepUp } from "@/lib/auth/stepUp";
import { parsePaymentMethodType } from "@/lib/validators/schemas";

export const DELETE = withApiHandler<{ type: string }>(async (request, { params }) => {
  const { type: rawType } = await params;
  const type = parsePaymentMethodType(rawType);

  const user = await getUserFromSession();
  if (!user) {
    throwApiError(401, "unauthorized", "Unauthorized");
  }

  // DELETE has no body in HTTP semantics, but fetch() allows one. We read
  // currentPassword from JSON body when present; same step-up policy as PUT.
  let currentPassword: string | null = null;
  try {
    const body = await request.json();
    if (body && typeof body.currentPassword === "string") {
      currentPassword = body.currentPassword;
    }
  } catch {
    // No body / not JSON — currentPassword stays null.
  }

  await requireStepUp({
    userId: user.id,
    authProvider: user.authProvider,
    currentPassword,
  });

  await prisma.paymentMethod.deleteMany({
    where: { userId: user.id, type },
  });

  return noContent();
});
