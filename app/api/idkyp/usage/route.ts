import { withSimpleApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { throwApiError } from "@/lib/api/errors";
import { getUserFromSession } from "@/lib/api/guards";
import { getIdkypQuotaInfo } from "@/lib/idkyp/usage";

export const GET = withSimpleApiHandler(async () => {
  const user = await getUserFromSession();
  if (!user) throwApiError(401, "unauthorized", "Sign in to view usage");
  const info = await getIdkypQuotaInfo(user.id);
  return ok({
    used: info.used,
    limit: info.unlimited ? null : info.limit,
    remaining: info.unlimited ? null : info.remaining,
    unlimited: info.unlimited,
  });
});
