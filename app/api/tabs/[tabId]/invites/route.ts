import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireTab, requireOpenTab } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";

function generateToken(): string {
  return crypto.randomBytes(18).toString("base64url");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tabId: string }> },
) {
  try {
    const { tabId: rawTabId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    const tab = await requireTab(tabId);
    if (tab.createdByUserId !== user.id) {
      throwApiError(403, "forbidden", "Only the creator can view invites");
    }

    // Return the single active invite for this tab
    const invite = await prisma.invite.findFirst({
      where: { tabId, revokedAt: null },
      select: { token: true, createdAt: true },
    });

    return ok({ invite: invite ? { token: invite.token, createdAt: invite.createdAt.toISOString() } : null });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ tabId: string }> },
) {
  try {
    const { tabId: rawTabId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    const tab = await requireOpenTab(tabId);
    if (tab.createdByUserId !== user.id) {
      throwApiError(403, "forbidden", "Only the creator can create invites");
    }

    // Find existing active invite or create a new one
    let invite = await prisma.invite.findFirst({
      where: { tabId, revokedAt: null },
      select: { token: true, createdAt: true },
    });

    if (!invite) {
      const token = generateToken();
      invite = await prisma.invite.create({
        data: {
          tabId,
          token,
          createdByUserId: user.id,
        },
        select: { token: true, createdAt: true },
      });
    }

    return ok({ invite });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
