import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { generatePin, hashPin } from "@/lib/auth/pin";
import { setSessionUserId } from "@/lib/session/session";

/**
 * GET /api/users/claim/[token]
 * Get information about a claim token (user name, tabs they're in).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    const claimToken = await prisma.userClaimToken.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            participants: {
              include: {
                tab: {
                  select: { id: true, name: true, status: true },
                },
              },
            },
          },
        },
      },
    });

    if (!claimToken) {
      throwApiError(404, "not_found", "Claim link not found or expired");
    }

    if (claimToken.claimedAt) {
      throwApiError(410, "already_claimed", "This account has already been claimed");
    }

    return ok({
      displayName: claimToken.user.displayName,
      tabs: claimToken.user.participants.map((p) => ({
        id: p.tab.id,
        name: p.tab.name,
        status: p.tab.status,
      })),
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}

/**
 * POST /api/users/claim/[token]
 * Claim a placeholder account by setting a PIN.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    const claimToken = await prisma.userClaimToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!claimToken) {
      throwApiError(404, "not_found", "Claim link not found or expired");
    }

    if (claimToken.claimedAt) {
      throwApiError(410, "already_claimed", "This account has already been claimed");
    }

    // Generate a random 4-digit PIN server-side
    const pin = generatePin();
    const pinHash = hashPin(pin);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: claimToken.userId },
        data: { pinHash },
      }),
      prisma.userClaimToken.update({
        where: { id: claimToken.id },
        data: { claimedAt: new Date() },
      }),
    ]);

    // Set session for the claimed user
    await setSessionUserId(claimToken.userId);

    return ok({
      success: true,
      userId: claimToken.userId,
      displayName: claimToken.user.displayName,
      pin,
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
