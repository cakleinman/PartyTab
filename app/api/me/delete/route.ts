import { withSimpleApiHandler } from "@/lib/api/handler";
import { throwApiError } from "@/lib/api/errors";
import { getUserFromSession } from "@/lib/api/guards";
import { ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

export const POST = withSimpleApiHandler(async (request) => {
  const user = await getUserFromSession();
  if (!user) {
    throwApiError(401, "unauthorized", "Unauthorized");
  }

  const body = await request.json();
  if (body?.confirmation !== "DELETE") {
    throwApiError(400, "validation_error", "Type DELETE to confirm account deletion");
  }

  // Soft-delete: anonymize user data, remove PII
  await prisma.$transaction([
    // Anonymize the user
    prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: "Deleted User",
        email: null,
        phone: null,
        guestEmail: null,
        guestEmailConsentAt: null,
        guestEmailSetByUserId: null,
        googleId: null,
        passwordHash: null,
        pinHash: null,
      },
    }),
    // Delete payment methods
    prisma.paymentMethod.deleteMany({
      where: { userId: user.id },
    }),
    // Delete push subscriptions
    prisma.pushSubscription.deleteMany({
      where: { userId: user.id },
    }),
    // Delete email preferences
    prisma.emailPreference.deleteMany({
      where: { userId: user.id },
    }),
  ]);

  return ok({ success: true });
});
