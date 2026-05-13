import { withApiHandler } from "@/lib/api/handler";
import { throwApiError } from "@/lib/api/errors";
import { getUserFromSession } from "@/lib/api/guards";
import { noContent } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { parseUuid } from "@/lib/validators/schemas";

export const DELETE = withApiHandler<{ id: string }>(async (_request, { params }) => {
  const { id: rawId } = await params;
  const id = parseUuid(rawId, "id");

  const user = await getUserFromSession();
  if (!user) {
    throwApiError(401, "unauthorized", "Unauthorized");
  }

  // Scope the delete by both id and userId to prevent IDOR.
  const result = await prisma.passkey.deleteMany({
    where: { id, userId: user.id },
  });

  if (result.count === 0) {
    throwApiError(404, "not_found", "Passkey not found");
  }

  return noContent();
});
