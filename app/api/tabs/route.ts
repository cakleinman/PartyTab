import { prisma } from "@/lib/db/prisma";
import { created, error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireUser } from "@/lib/api/guards";
import { parseDateInput, parseDescription, parseTabName, parseUuid } from "@/lib/validators/schemas";
import { randomBytes } from "crypto";

const BASIC_TAB_LIMIT = 3;

export async function GET() {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return ok({ tabs: [] });
    }
    const tabs = await prisma.tab.findMany({
      where: {
        participants: {
          some: { userId: user.id },
        },
        archivedAt: null,
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        closedAt: true,
        createdByUserId: true,
        settlement: {
          select: {
            transfers: {
              select: { id: true },
            },
          },
        },
        acknowledgements: {
          select: {
            status: true,
          },
        },
      },
    });

    return ok({
      tabs: tabs.map((tab) => {
        const totalTransfers = tab.settlement?.transfers.length ?? 0;
        const confirmedCount = tab.acknowledgements.filter((a) => a.status === "ACKNOWLEDGED").length;

        return {
          id: tab.id,
          name: tab.name,
          status: tab.status === "ACTIVE" ? "ACTIVE" : "CLOSED",
          startDate: tab.startDate.toISOString().slice(0, 10),
          endDate: tab.endDate ? tab.endDate.toISOString().slice(0, 10) : null,
          createdAt: tab.createdAt.toISOString(),
          closedAt: tab.closedAt ? tab.closedAt.toISOString() : null,
          isCreator: tab.createdByUserId === user.id,
          settlementProgress: tab.status === "CLOSED" ? {
            total: totalTransfers,
            confirmed: confirmedCount,
            percent: totalTransfers > 0 ? Math.round((confirmedCount / totalTransfers) * 100) : 100,
          } : null,
        };
      }),
    });
  } catch {
    return apiError(500, "forbidden", "Unexpected error");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await requireUser(body?.displayName, body?.pin);
    const name = parseTabName(body?.name);
    const description = parseDescription(body?.description);
    const startDate = parseDateInput(body?.startDate) ?? new Date();

    // Guests cannot create tabs - must upgrade to Basic or Pro
    if (user.subscriptionTier === "GUEST") {
      throwApiError(
        403,
        "upgrade_required",
        "Creating tabs requires a free account. Sign in with Google or email to create tabs."
      );
    }

    // Check tab limit for non-Pro users
    if (user.subscriptionTier !== "PRO") {
      const activeTabCount = await prisma.tab.count({
        where: {
          createdByUserId: user.id,
          status: "ACTIVE",
        },
      });

      if (activeTabCount >= BASIC_TAB_LIMIT) {
        throwApiError(
          403,
          "tab_limit_reached",
          `You've reached the limit of ${BASIC_TAB_LIMIT} active tabs. Close a tab or upgrade to Pro for unlimited tabs.`
        );
      }
    }

    // Parse optional copyFromTabId
    const copyFromTabId = body?.copyFromTabId ? parseUuid(body.copyFromTabId, "copyFromTabId") : null;

    // Get participants to copy if copying from another tab
    let participantsToCopy: { userId: string; displayName: string; isPlaceholder: boolean }[] = [];
    if (copyFromTabId) {
      const sourceTab = await prisma.tab.findUnique({
        where: { id: copyFromTabId },
        include: {
          participants: {
            include: { user: true },
          },
        },
      });
      const isParticipant = sourceTab?.participants.some((p) => p.userId === user.id);
      if (sourceTab && isParticipant) {
        participantsToCopy = sourceTab.participants
          .filter((p) => p.userId !== user.id) // exclude self
          .map((p) => ({
            userId: p.userId,
            displayName: p.user.displayName,
            isPlaceholder: !p.user.pinHash && !p.user.googleId && !p.user.passwordHash,
          }));
      }
    }

    const tab = await prisma.tab.create({
      data: {
        name,
        description,
        startDate,
        createdByUserId: user.id,
        participants: {
          create: {
            userId: user.id,
          },
        },
      },
    });

    // Add copied participants
    for (const p of participantsToCopy) {
      if (p.isPlaceholder) {
        // Create new placeholder user with same displayName
        const newUser = await prisma.user.create({
          data: { displayName: p.displayName, authProvider: "GUEST" },
        });
        await prisma.participant.create({
          data: { tabId: tab.id, userId: newUser.id },
        });
        // Generate claim token
        const token = randomBytes(32).toString("hex");
        await prisma.userClaimToken.create({
          data: { userId: newUser.id, token },
        });
      } else {
        // Real user - add directly
        await prisma.participant.create({
          data: { tabId: tab.id, userId: p.userId },
        });
      }
    }

    return created({
      tab: {
        id: tab.id,
        name: tab.name,
        status: tab.status,
        startDate: tab.startDate.toISOString().slice(0, 10),
        endDate: tab.endDate ? tab.endDate.toISOString().slice(0, 10) : null,
        createdAt: tab.createdAt.toISOString(),
        closedAt: tab.closedAt ? tab.closedAt.toISOString() : null,
      },
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
