import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { createPortalSession } from "@/lib/stripe/billing";
import { ok, error as apiError } from "@/lib/api/response";

const { auth: getSession } = NextAuth(authConfig);

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return apiError(401, "unauthorized", "Authentication required");
    }

    const url = await createPortalSession(session.user.id);
    return ok({ url });
  } catch (err) {
    console.error("Portal Error:", err);
    return apiError(500, "internal_error", "Failed to create portal session");
  }
}
