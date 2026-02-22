import { withSimpleApiHandler } from "@/lib/api/handler";
import { throwApiError } from "@/lib/api/errors";
import { getUserFromSession } from "@/lib/api/guards";
import { ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
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
