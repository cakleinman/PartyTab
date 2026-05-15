import { cookies } from "next/headers";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { withSimpleApiHandler } from "@/lib/api/handler";
import { throwApiError } from "@/lib/api/errors";
import { getUserFromSession } from "@/lib/api/guards";
import { ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import {
  RP_ID,
  RP_NAME,
  PASSKEY_CHALLENGE_COOKIE,
  PASSKEY_CHALLENGE_TTL_MS,
} from "@/lib/passkeys/config";
import { serializeChallenge } from "@/lib/passkeys/challengeCookie";

export const POST = withSimpleApiHandler(async () => {
  const user = await getUserFromSession();
  if (!user) {
    throwApiError(401, "unauthorized", "Unauthorized");
  }

  // Don't allow guest accounts to enrol — they have no durable identity yet.
  if (user.authProvider === "GUEST") {
    throwApiError(403, "upgrade_required", "Create an account before enrolling a passkey");
  }

  // Exclude already-enrolled credentials so the same device can't enrol twice.
  const existing = await prisma.passkey.findMany({
    where: { userId: user.id },
    select: { credentialId: true, transports: true },
    take: 20,
  });

  // v13: userID is optional — the library generates a random opaque identifier.
  // We bind the resulting credential to the user via the Passkey.userId FK on
  // the verify route, so we don't need (and shouldn't leak) our real user.id
  // into the WebAuthn handle that authenticators store locally.
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: user.email ?? user.displayName,
    userDisplayName: user.displayName,
    attestationType: "none",
    excludeCredentials: existing.map((p) => ({
      id: Buffer.from(p.credentialId).toString("base64url"),
      transports: p.transports as AuthenticatorTransportFuture[],
    })),
    authenticatorSelection: {
      residentKey: "required",   // we want discoverable credentials
      userVerification: "preferred",
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(
    PASSKEY_CHALLENGE_COOKIE,
    serializeChallenge({
      challenge: options.challenge,
      userId: user.id,
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
