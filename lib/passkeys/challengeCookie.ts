import crypto from "crypto";

// HMAC-signed cookie carrying a one-time WebAuthn challenge. We sign the
// challenge so the same cookie that carries it also proves it came from us
// (and hasn't been swapped in by an attacker). 5-minute TTL is generous for
// the user-tap interaction but not so long that replay becomes practical.

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

export interface ChallengePayload {
  challenge: string;
  // For enrolment we know the user; for login challenge we don't, so optional.
  userId?: string;
  // Issued-at, used to enforce TTL server-side regardless of cookie maxAge.
  iat: number;
}

export function serializeChallenge(payload: ChallengePayload): string {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json, "utf8").toString("base64url");
  const sig = sign(b64);
  return `${b64}.${sig}`;
}

export function parseChallenge(raw: string | undefined): ChallengePayload | null {
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
    const obj = JSON.parse(json) as ChallengePayload;
    if (typeof obj?.challenge !== "string" || typeof obj?.iat !== "number") return null;
    return obj;
  } catch {
    return null;
  }
}
