import crypto from "crypto";

const SESSION_COOKIE = "partytab_session";

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to 32+ characters");
  }
  return secret;
}

function sign(value: string): string {
  const secret = getSessionSecret();
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function serializeSession(userId: string): string {
  const signature = sign(userId);
  return `${userId}.${signature}`;
}

export function parseSession(value: string): string | null {
  const [userId, signature] = value.split(".");
  if (!userId || !signature) return null;
  const expected = sign(userId);
  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (signatureBuf.length !== expectedBuf.length) return null;
  return crypto.timingSafeEqual(signatureBuf, expectedBuf) ? userId : null;
}

export { SESSION_COOKIE };
