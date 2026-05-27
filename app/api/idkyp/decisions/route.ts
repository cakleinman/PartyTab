import { withSimpleApiHandler } from "@/lib/api/handler";
import { created } from "@/lib/api/response";
import { throwApiError } from "@/lib/api/errors";
import { getUserFromSession } from "@/lib/api/guards";
import { prisma } from "@/lib/db/prisma";
import { getIdkypQuotaInfo, incrementIdkypUsage } from "@/lib/idkyp/usage";

type DecisionBody = {
  winnerPlaceId?: unknown;
  winnerName?: unknown;
  winnerLat?: unknown;
  winnerLng?: unknown;
  filtersSnapshot?: unknown;
};

export const POST = withSimpleApiHandler(async (request) => {
  const user = await getUserFromSession();
  if (!user) throwApiError(401, "unauthorized", "Sign in to record decisions");

  const body = (await request.json().catch(() => null)) as DecisionBody | null;
  if (!body) throwApiError(400, "validation_error", "Body required");

  const winnerPlaceId =
    typeof body.winnerPlaceId === "string" && body.winnerPlaceId.length > 0
      ? body.winnerPlaceId
      : null;
  const winnerName =
    typeof body.winnerName === "string" && body.winnerName.length > 0
      ? body.winnerName
      : null;
  const winnerLat = Number(body.winnerLat);
  const winnerLng = Number(body.winnerLng);

  if (!winnerPlaceId) throwApiError(400, "validation_error", "winnerPlaceId required");
  if (!winnerName) throwApiError(400, "validation_error", "winnerName required");
  if (!Number.isFinite(winnerLat) || winnerLat < -90 || winnerLat > 90) {
    throwApiError(400, "validation_error", "winnerLat must be -90..90");
  }
  if (!Number.isFinite(winnerLng) || winnerLng < -180 || winnerLng > 180) {
    throwApiError(400, "validation_error", "winnerLng must be -180..180");
  }

  const quota = await getIdkypQuotaInfo(user.id);
  if (!quota.unlimited && quota.remaining <= 0) {
    throwApiError(429, "limit_exceeded", `Monthly IDKYP limit reached (${quota.limit}/month)`);
  }

  await prisma.idkypDecision.create({
    data: {
      userId: user.id,
      winnerPlaceId,
      winnerName,
      winnerLat,
      winnerLng,
      filtersSnapshot: (body.filtersSnapshot ?? {}) as object,
    },
  });

  await incrementIdkypUsage(user.id);
  const next = await getIdkypQuotaInfo(user.id);

  return created({
    used: next.used,
    limit: next.unlimited ? null : next.limit,
    remaining: next.unlimited ? null : next.remaining,
    unlimited: next.unlimited,
  });
});
