import { prisma } from "@/lib/db/prisma";
import { created, error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireUser } from "@/lib/api/guards";
import { parseDateInput, parseDescription, parseTabName } from "@/lib/validators/schemas";

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
