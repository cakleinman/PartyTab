// Relying-party configuration for WebAuthn. The RP ID is the eTLD+1 of the
// origin — for partytab.app that's "partytab.app". WebAuthn binds passkeys
// to the RP ID, so this must match the production hostname exactly. We
// derive it from APP_BASE_URL with a localhost fallback for dev.

import { URL } from "url";

function deriveOrigin(): string {
  const raw = process.env.APP_BASE_URL;
  if (raw) {
    try {
      const url = new URL(raw);
      return `${url.protocol}//${url.host}`;
    } catch {
      // fall through
    }
  }
  return "http://localhost:3000";
}

function deriveRpId(origin: string): string {
  try {
    const url = new URL(origin);
    return url.hostname;
  } catch {
    return "localhost";
  }
}

export const RP_NAME = "PartyTab";
export const EXPECTED_ORIGIN = deriveOrigin();
export const RP_ID = deriveRpId(EXPECTED_ORIGIN);

export const PASSKEY_CHALLENGE_COOKIE = "partytab_passkey_challenge";
export const PASSKEY_CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes
