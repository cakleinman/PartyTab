import { withSimpleApiHandler } from "@/lib/api/handler";
import { error, ok } from "@/lib/api/response";
import { throwApiError } from "@/lib/api/errors";
import { getUserFromSession } from "@/lib/api/guards";
import { fetchNearbyRestaurants } from "@/lib/idkyp/places";

const MAX_RADIUS_MI = 30;
const MIN_RADIUS_MI = 0.1;

export const POST = withSimpleApiHandler(async (request) => {
  const user = await getUserFromSession();
  if (!user) throwApiError(401, "unauthorized", "Sign in to search places");

  const body = (await request.json().catch(() => null)) as {
    lat?: unknown;
    lng?: unknown;
    radiusMiles?: unknown;
  } | null;

  if (!body) throwApiError(400, "validation_error", "Body required");
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  const radiusMiles = Number(body.radiusMiles);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throwApiError(400, "validation_error", "lat must be -90..90");
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throwApiError(400, "validation_error", "lng must be -180..180");
  }
  if (!Number.isFinite(radiusMiles) || radiusMiles < MIN_RADIUS_MI || radiusMiles > MAX_RADIUS_MI) {
    throwApiError(400, "validation_error", `radiusMiles must be ${MIN_RADIUS_MI}..${MAX_RADIUS_MI}`);
  }

  try {
    const result = await fetchNearbyRestaurants({
      center: { lat, lng },
      radiusMiles,
    });
    return ok(result);
  } catch (e) {
    console.error("[idkyp/places] upstream error:", e instanceof Error ? e.message : e);
    return error(503, "service_unavailable", "Restaurant search is temporarily unavailable");
  }
});
