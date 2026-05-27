import { withSimpleApiHandler } from "@/lib/api/handler";
import { error } from "@/lib/api/response";

export const POST = withSimpleApiHandler(async () => {
  return error(501, "not_implemented", "IDKYP decision recording lands in Phase 3");
});
