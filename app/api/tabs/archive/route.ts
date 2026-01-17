import { prisma } from "@/lib/db/prisma";
import { ok, error as apiError } from "@/lib/api/response";
import { getUserFromSession } from "@/lib/api/guards";

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
        archivedAt: { not: null },
      },
      orderBy: { archivedAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        closedAt: true,
        archivedAt: true,
        createdByUserId: true,
      },
    });

    return ok({
      tabs: tabs.map((tab) => ({
        id: tab.id,
        name: tab.name,
        status: tab.status,
        startDate: tab.startDate.toISOString().slice(0, 10),
        endDate: tab.endDate ? tab.endDate.toISOString().slice(0, 10) : null,
        createdAt: tab.createdAt.toISOString(),
        closedAt: tab.closedAt ? tab.closedAt.toISOString() : null,
        archivedAt: tab.archivedAt?.toISOString() ?? null,
        isCreator: tab.createdByUserId === user.id,
      })),
    });
  } catch {
    return apiError(500, "internal_error", "Unexpected error");
  }
}
