import { ok } from "@/lib/api/response";
import { clearSession } from "@/lib/session/session";

export async function POST() {
  await clearSession();
  return ok({ loggedOut: true });
}
