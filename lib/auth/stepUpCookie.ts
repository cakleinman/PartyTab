import crypto from "crypto";

// HMAC-signed cookie proving the user just completed a step-up re-authentication.
// Mirrors lib/passkeys/challengeCookie.ts: signing means the cookie's payload
// can't be forged with only a stolen session cookie. 5-minute TTL lets a user
// update multiple payment methods in one sitting without re-prompting.

export const STEP_UP_COOKIE = "partytab_stepup";
export const STEP_UP_TTL_MS = 5 * 60 * 1000;

export interface StepUpPayload {
  userId: string;
  iat: number;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to 32+ characters");
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function serializeStepUp(payload: StepUpPayload): string {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json, "utf8").toString("base64url");
  const sig = sign(b64);
  return `${b64}.${sig}`;
}

export function parseStepUp(raw: string | undefined): StepUpPayload | null {
  if (!raw) return null;
  const [b64, sig] = raw.split(".");
  if (!b64 || !sig) return null;
  const expected = sign(b64);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    const json = Buffer.from(b64, "base64url").toString("utf8");
    const obj = JSON.parse(json) as StepUpPayload;
    if (typeof obj?.userId !== "string" || typeof obj?.iat !== "number") return null;
    return obj;
  } catch {
    return null;
  }
}
