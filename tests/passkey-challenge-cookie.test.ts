import { describe, it, expect, beforeAll } from "vitest";
import { serializeChallenge, parseChallenge } from "@/lib/passkeys/challengeCookie";

beforeAll(() => {
  // The signer requires SESSION_SECRET >= 32 chars.
  process.env.SESSION_SECRET = "x".repeat(48);
});

describe("passkey challenge cookie", () => {
  it("round-trips a serialised payload", () => {
    const payload = { challenge: "abc123", userId: "u1", iat: 1_700_000_000_000 };
    const cookie = serializeChallenge(payload);
    const parsed = parseChallenge(cookie);
    expect(parsed).toEqual(payload);
  });

  it("accepts a payload without userId (login flow)", () => {
    const payload = { challenge: "def456", iat: 1_700_000_000_000 };
    const cookie = serializeChallenge(payload);
    const parsed = parseChallenge(cookie);
    expect(parsed).toEqual(payload);
  });

  it("rejects a tampered signature", () => {
    const cookie = serializeChallenge({ challenge: "abc", iat: 1 });
    const [b64] = cookie.split(".");
    const tampered = `${b64}.deadbeefdeadbeef`;
    expect(parseChallenge(tampered)).toBeNull();
  });

  it("rejects a tampered payload (signature won't match)", () => {
    const cookie = serializeChallenge({ challenge: "abc", iat: 1 });
    const [, sig] = cookie.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ challenge: "different", iat: 1 }),
    ).toString("base64url");
    const tampered = `${tamperedPayload}.${sig}`;
    expect(parseChallenge(tampered)).toBeNull();
  });

  it("returns null for missing or malformed input", () => {
    expect(parseChallenge(undefined)).toBeNull();
    expect(parseChallenge("")).toBeNull();
    expect(parseChallenge("no-dot")).toBeNull();
    expect(parseChallenge(".no-payload")).toBeNull();
    expect(parseChallenge("no-sig.")).toBeNull();
  });
});
