import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant, requireTab, checkApiRateLimit, logApiResponse } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";
import crypto from "crypto";

// POST: Generate a share token for the tab
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tabId: string }> },
) {
  const startTime = Date.now();
  try {
    const { tabId: rawTabId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }

    const { response: rateLimitResponse } = await checkApiRateLimit(request, user.id);
    if (rateLimitResponse) return rateLimitResponse;

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
    const response = ok({
      shareToken,
      shareUrl: `${baseUrl}/share/${shareToken}`,
    });
    logApiResponse(request, user.id, response.status, startTime);
    return response;
  } catch (error) {
    if (isApiError(error)) {
      const response = apiError(error.status, error.code, error.message);
      logApiResponse(request, null, response.status, startTime);
      return response;
    }
    const response = validationError(error);
    logApiResponse(request, null, response.status, startTime);
    return response;
  }
}

// GET: Return existing share URL
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tabId: string }> },
) {
  const startTime = Date.now();
  try {
    const { tabId: rawTabId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }

    const { response: rateLimitResponse } = await checkApiRateLimit(request, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    await requireParticipant(tabId, user.id);

    const tab = await prisma.tab.findUnique({
      where: { id: tabId },
      select: { shareToken: true },
    });

    if (!tab?.shareToken) {
      const response = ok({ shareToken: null, shareUrl: null });
      logApiResponse(request, user.id, response.status, startTime);
      return response;
    }

    const baseUrl = process.env.APP_BASE_URL || "https://partytab.app";
    const response = ok({
      shareToken: tab.shareToken,
      shareUrl: `${baseUrl}/share/${tab.shareToken}`,
    });
    logApiResponse(request, user.id, response.status, startTime);
    return response;
  } catch (error) {
    if (isApiError(error)) {
      const response = apiError(error.status, error.code, error.message);
      logApiResponse(request, null, response.status, startTime);
      return response;
    }
    const response = validationError(error);
    logApiResponse(request, null, response.status, startTime);
    return response;
  }
}
