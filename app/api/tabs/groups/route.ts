import { prisma } from "@/lib/db/prisma";
import { ok, error as apiError } from "@/lib/api/response";
import { getUserFromSession, checkApiRateLimit, logApiResponse } from "@/lib/api/guards";

export async function GET(request: Request) {
  const startTime = Date.now();
  try {
    const user = await getUserFromSession();
    const { response: rateLimitResponse } = await checkApiRateLimit(request, user?.id);
    if (rateLimitResponse) return rateLimitResponse;

    if (!user) {
      const result = ok({ groups: [] });
      logApiResponse(request, null, result.status, startTime);
      return result;
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

    const result = ok({
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
    logApiResponse(request, user?.id ?? null, result.status, startTime);
    return result;
  } catch (error) {
    const result = apiError(500, "internal_error", "Unexpected error");
    logApiResponse(request, null, result.status, startTime);
    return result;
  }
}
