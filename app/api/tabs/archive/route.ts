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
      const result = ok({ tabs: [] });
      logApiResponse(request, null, result.status, startTime);
      return result;
    }
    const tabs = await prisma.tab.findMany({
      where: {
        participants: {
          some: { userId: user.id },
        },
        archivedAt: { not: null },
      },
      orderBy: { archivedAt: "desc" },
      take: 100,
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

    const result = ok({
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
    logApiResponse(request, user?.id ?? null, result.status, startTime);
    return result;
  } catch (error) {
    const result = apiError(500, "internal_error", "Unexpected error");
    logApiResponse(request, null, result.status, startTime);
    return result;
  }
}
