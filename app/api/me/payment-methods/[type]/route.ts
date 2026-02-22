import { withApiHandler } from "@/lib/api/handler";
import { throwApiError } from "@/lib/api/errors";
import { getUserFromSession } from "@/lib/api/guards";
import { noContent } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { parsePaymentMethodType } from "@/lib/validators/schemas";

export const DELETE = withApiHandler<{ type: string }>(async (_request, { params }) => {
  const { type: rawType } = await params;
  const type = parsePaymentMethodType(rawType);

  const user = await getUserFromSession();
  if (!user) {
    throwApiError(401, "unauthorized", "Unauthorized");
  }

  await prisma.paymentMethod.deleteMany({
    where: { userId: user.id, type },
  });

  return noContent();
});
