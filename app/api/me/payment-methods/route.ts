import { withSimpleApiHandler } from "@/lib/api/handler";
import { throwApiError } from "@/lib/api/errors";
import { getUserFromSession } from "@/lib/api/guards";
import { ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { requireStepUp } from "@/lib/auth/stepUp";
import {
  parsePaymentMethodType,
  parsePaymentHandle,
  parsePaymentLabel,
} from "@/lib/validators/schemas";

export const GET = withSimpleApiHandler(async () => {
  const user = await getUserFromSession();
  if (!user) {
    throwApiError(401, "unauthorized", "Unauthorized");
  }

  const paymentMethods = await prisma.paymentMethod.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      type: true,
      handle: true,
      label: true,
    },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  return ok({ paymentMethods });
});

export const PUT = withSimpleApiHandler(async (request) => {
  const user = await getUserFromSession();
  if (!user) {
    throwApiError(401, "unauthorized", "Unauthorized");
  }

  // Guest users can't save payment methods
  if (user.authProvider === "GUEST") {
    throwApiError(403, "upgrade_required", "Create an account to save payment methods");
  }

  const body = await request.json();
  const type = parsePaymentMethodType(body?.type);
  const handle = parsePaymentHandle(body?.handle);
  const label = parsePaymentLabel(body?.label);
  const currentPassword =
    typeof body?.currentPassword === "string" ? body.currentPassword : null;

  // Step-up re-auth: a saved payment method controls where group payments
  // get routed (Venmo handle etc.), so changing it requires a fresh proof
  // that the session belongs to the real user — not just a stolen cookie.
  await requireStepUp({
    userId: user.id,
    authProvider: user.authProvider,
    currentPassword,
  });

  const paymentMethod = await prisma.paymentMethod.upsert({
    where: {
      userId_type: {
        userId: user.id,
        type,
      },
    },
    update: { handle, label },
    create: { userId: user.id, type, handle, label },
    select: {
      id: true,
      type: true,
      handle: true,
      label: true,
    },
  });

  return ok({ paymentMethod });
});
