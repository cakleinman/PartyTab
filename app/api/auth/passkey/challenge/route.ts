import { cookies } from "next/headers";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { withSimpleApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import {
  RP_ID,
  PASSKEY_CHALLENGE_COOKIE,
  PASSKEY_CHALLENGE_TTL_MS,
} from "@/lib/passkeys/config";
import { serializeChallenge } from "@/lib/passkeys/challengeCookie";

// Pre-login challenge for discoverable credentials. We don't know the user
// at this point — the assertion will tell us via the credentialId.
//
// This endpoint is unauthenticated; the wrapped handler still applies
// content-type validation. Rate limiting is enforced via the audit-log job
// per the standard wrapper. For stricter IP-based throttling we lean on
// the existing generic limiter (lib/auth/rate-limit.ts).
export const POST = withSimpleApiHandler(async () => {
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: "preferred",
    // empty allowCredentials => let the browser surface any discoverable
    // credential bound to this RP. Required for passwordless flow.
    allowCredentials: [],
  });

  const cookieStore = await cookies();
  cookieStore.set(
    PASSKEY_CHALLENGE_COOKIE,
    serializeChallenge({
      challenge: options.challenge,
      iat: Date.now(),
    }),
    {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.ceil(PASSKEY_CHALLENGE_TTL_MS / 1000),
    },
  );

  return ok({ options });
});
