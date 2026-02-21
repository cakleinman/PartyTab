import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant, requireTab } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";
import crypto from "crypto";

// POST: Generate a share token for the tab
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
    await requireTab(tabId);
    await requireParticipant(tabId, user.id);

    // Check if token already exists
    const tab = await prisma.tab.findUnique({
      where: { id: tabId },
      select: { shareToken: true },
    });

    let shareToken = tab?.shareToken;
    if (!shareToken) {
      shareToken = crypto.randomBytes(16).toString("base64url");
      await prisma.tab.update({
        where: { id: tabId },
        data: { shareToken },
      });
    }

    const baseUrl = process.env.APP_BASE_URL || "https://partytab.app";
    return ok({
      shareToken,
      shareUrl: `${baseUrl}/share/${shareToken}`,
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}

// GET: Return existing share URL
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
    await requireParticipant(tabId, user.id);

    const tab = await prisma.tab.findUnique({
      where: { id: tabId },
      select: { shareToken: true },
    });

    if (!tab?.shareToken) {
      return ok({ shareToken: null, shareUrl: null });
    }

    const baseUrl = process.env.APP_BASE_URL || "https://partytab.app";
    return ok({
      shareToken: tab.shareToken,
      shareUrl: `${baseUrl}/share/${tab.shareToken}`,
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
