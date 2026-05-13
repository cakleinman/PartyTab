import { cookies } from "next/headers";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import { withSimpleApiHandler } from "@/lib/api/handler";
import { throwApiError } from "@/lib/api/errors";
import { getUserFromSession } from "@/lib/api/guards";
import { ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import {
  RP_ID,
  EXPECTED_ORIGIN,
  PASSKEY_CHALLENGE_COOKIE,
  PASSKEY_CHALLENGE_TTL_MS,
} from "@/lib/passkeys/config";
import { parseChallenge } from "@/lib/passkeys/challengeCookie";

export const POST = withSimpleApiHandler(async (request) => {
  const user = await getUserFromSession();
  if (!user) {
    throwApiError(401, "unauthorized", "Unauthorized");
  }

  const body = await request.json();
  const response = body?.response as RegistrationResponseJSON | undefined;
  const deviceName =
    typeof body?.deviceName === "string" && body.deviceName.length <= 80
      ? body.deviceName
      : null;

  if (!response) {
    throwApiError(400, "validation_error", "Missing registration response");
  }

  const cookieStore = await cookies();
  const cookieRaw = cookieStore.get(PASSKEY_CHALLENGE_COOKIE)?.value;
  const challenge = parseChallenge(cookieRaw);
  // Clear the challenge cookie immediately — single-use.
  cookieStore.delete(PASSKEY_CHALLENGE_COOKIE);

  if (!challenge || challenge.userId !== user.id) {
    throwApiError(400, "validation_error", "No active enrolment challenge");
  }
  if (Date.now() - challenge.iat > PASSKEY_CHALLENGE_TTL_MS) {
    throwApiError(400, "validation_error", "Enrolment challenge expired");
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: EXPECTED_ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: false,
    });
  } catch (err) {
    throwApiError(
      400,
      "validation_error",
      err instanceof Error ? err.message : "Verification failed",
    );
  }

  if (!verification.verified || !verification.registrationInfo) {
    throwApiError(400, "validation_error", "Passkey could not be verified");
  }

  const { credential } = verification.registrationInfo;
  if (!credential) {
    throwApiError(500, "internal_error", "Missing credential after verification");
  }

  await prisma.passkey.create({
    data: {
      userId: user.id,
      credentialId: Buffer.from(credential.id, "base64url"),
      publicKey: Buffer.from(credential.publicKey),
      counter: BigInt(credential.counter ?? 0),
      transports: (response.response.transports ?? []) as string[],
      deviceName,
    },
  });

  return ok({ enrolled: true });
});
