import { describe, it, expect, beforeAll } from "vitest";
import crypto from "crypto";
import { serializeStepUp, parseStepUp } from "@/lib/auth/stepUpCookie";

beforeAll(() => {
  // The signer requires SESSION_SECRET >= 32 chars.
  process.env.SESSION_SECRET = "x".repeat(48);
});

describe("step-up cookie", () => {
  it("round-trips a serialised payload", () => {
    const payload = { userId: "u1", iat: 1_700_000_000_000 };
    const cookie = serializeStepUp(payload);
    const parsed = parseStepUp(cookie);
    expect(parsed).toEqual(payload);
  });

  it("rejects a tampered signature", () => {
    const cookie = serializeStepUp({ userId: "u1", iat: 1 });
    const [b64] = cookie.split(".");
    const tampered = `${b64}.deadbeefdeadbeef`;
    expect(parseStepUp(tampered)).toBeNull();
  });

  it("rejects a tampered payload (signature won't match)", () => {
    const cookie = serializeStepUp({ userId: "u1", iat: 1 });
    const [, sig] = cookie.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ userId: "attacker", iat: 1 }),
    ).toString("base64url");
    const tampered = `${tamperedPayload}.${sig}`;
    expect(parseStepUp(tampered)).toBeNull();
  });

  it("returns null for missing or malformed input", () => {
    expect(parseStepUp(undefined)).toBeNull();
    expect(parseStepUp("")).toBeNull();
    expect(parseStepUp("no-dot")).toBeNull();
    expect(parseStepUp(".no-payload")).toBeNull();
    expect(parseStepUp("no-sig.")).toBeNull();
  });

  it("returns null when fields are wrong types (signed but malformed)", () => {
    // Sign a well-formed cookie envelope but with wrong-typed fields, to
    // exercise the type-shape check after the signature check passes.
    const malformed = Buffer.from(JSON.stringify({ userId: 123, iat: "x" })).toString(
      "base64url",
    );
    const sig = crypto
      .createHmac("sha256", process.env.SESSION_SECRET!)
      .update(malformed)
      .digest("hex");
    expect(parseStepUp(`${malformed}.${sig}`)).toBeNull();
  });
});
