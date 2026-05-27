import { withSimpleApiHandler } from "@/lib/api/handler";
import { error } from "@/lib/api/response";

export const GET = withSimpleApiHandler(async () => {
  return error(501, "not_implemented", "IDKYP usage tracking lands in Phase 3");
});
