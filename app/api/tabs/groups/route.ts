import { prisma } from "@/lib/db/prisma";
import { ok, error as apiError } from "@/lib/api/response";
import { getUserFromSession } from "@/lib/api/guards";

export async function GET() {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return ok({ groups: [] });
    }

    const tabs = await prisma.tab.findMany({
      where: {
        participants: { some: { userId: user.id } },
        archivedAt: null,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        participants: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    return ok({
      groups: tabs.map((tab) => ({
        tabId: tab.id,
        tabName: tab.name,
        participants: tab.participants
          .filter((p) => p.userId !== user.id) // exclude self
          .map((p) => ({
            userId: p.userId,
            displayName: p.user.displayName,
          })),
      })).filter((g) => g.participants.length > 0), // only tabs with other participants
    });
  } catch {
    return apiError(500, "internal_error", "Unexpected error");
  }
}
