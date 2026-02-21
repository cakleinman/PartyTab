import { ok, error as apiError } from "@/lib/api/response";
import { getUserFromSession } from "@/lib/api/guards";
import { getReceiptQuotaInfo } from "@/lib/billing/usage";

export async function GET() {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return apiError(401, "unauthorized", "Unauthorized");
    }
    const quota = await getReceiptQuotaInfo(user.id);
    return ok({ quota });
  } catch {
    return apiError(500, "internal_error", "Failed to fetch receipt quota");
  }
}
