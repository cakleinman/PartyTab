import { withSimpleApiHandler } from "@/lib/api/handler";
import { throwApiError } from "@/lib/api/errors";
import { getUserFromSession } from "@/lib/api/guards";
import { ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

export const GET = withSimpleApiHandler(async () => {
  const user = await getUserFromSession();
  if (!user) {
    throwApiError(401, "unauthorized", "Unauthorized");
  }

  const passkeys = await prisma.passkey.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      deviceName: true,
      createdAt: true,
      lastUsedAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return ok({ passkeys });
});
