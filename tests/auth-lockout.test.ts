import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the prisma client BEFORE importing the authConfig.
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

vi.mock("@/lib/session/parse", () => ({
  SESSION_COOKIE: "partytab_session",
  parseSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import bcrypt from "bcrypt";
import { authConfig } from "@/lib/auth/config";

// Extract the Credentials provider's authorize fn for direct testing.
// NextAuth v5 wraps the user-provided authorize; the real implementation lives
// on provider.options.authorize (the top-level provider.authorize is a stub
// that NextAuth swaps in at request time).
function getCredentialsAuthorize() {
  const credentialsProvider = authConfig.providers!.find((p) => {
    const pAny = p as { id?: string };
    return pAny.id === "credentials";
  }) as { options?: { authorize?: (creds: unknown) => Promise<unknown> } } | undefined;

  const authorize = credentialsProvider?.options?.authorize;
  if (typeof authorize !== "function") {
    throw new Error("Credentials provider options.authorize not found");
  }
  return authorize;
}

describe("authorize() lockout policy", () => {
  let authorize: (creds: unknown) => Promise<unknown>;

  beforeEach(() => {
    mockFindUnique.mockReset();
    mockUpdate.mockReset();
    authorize = getCredentialsAuthorize();
  });

  it("returns null when credentials are missing", async () => {
    const result = await authorize({});
    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("returns null for unknown email (no enumeration via behaviour)", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await authorize({ email: "unknown@example.com", password: "anything" });
    expect(result).toBeNull();
    // No update call — we don't track failures for accounts that don't exist.
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns null when user has no passwordHash (e.g. Google-only)", async () => {
    mockFindUnique.mockResolvedValue({
      id: "u1",
      email: "google@example.com",
      passwordHash: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
    const result = await authorize({ email: "google@example.com", password: "anything" });
    expect(result).toBeNull();
  });

  it("returns null and increments failedLoginAttempts on wrong password", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockFindUnique.mockResolvedValue({
      id: "u1",
      email: "x@example.com",
      displayName: "X",
      passwordHash,
      failedLoginAttempts: 2,
      lockedUntil: null,
    });
    mockUpdate.mockResolvedValue({});

    const result = await authorize({ email: "x@example.com", password: "wrong-password" });

    expect(result).toBeNull();
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: {
        failedLoginAttempts: 3,
        lockedUntil: null,
      },
    });
  });

  it("locks the account on the 5th failed attempt", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockFindUnique.mockResolvedValue({
      id: "u1",
      email: "x@example.com",
      displayName: "X",
      passwordHash,
      failedLoginAttempts: 4,
      lockedUntil: null,
    });
    mockUpdate.mockResolvedValue({});

    const before = Date.now();
    const result = await authorize({ email: "x@example.com", password: "wrong-password" });
    const after = Date.now();

    expect(result).toBeNull();
    expect(mockUpdate).toHaveBeenCalledOnce();
    const call = mockUpdate.mock.calls[0][0];
    expect(call.data.failedLoginAttempts).toBe(5);
    expect(call.data.lockedUntil).toBeInstanceOf(Date);
    const lockedAtMs = (call.data.lockedUntil as Date).getTime();
    // 15-minute lockout, allow ±5s for scheduling slop.
    expect(lockedAtMs).toBeGreaterThanOrEqual(before + 15 * 60 * 1000 - 5000);
    expect(lockedAtMs).toBeLessThanOrEqual(after + 15 * 60 * 1000 + 5000);
  });

  it("refuses login while account is locked, even with correct password", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockFindUnique.mockResolvedValue({
      id: "u1",
      email: "x@example.com",
      displayName: "X",
      passwordHash,
      failedLoginAttempts: 5,
      lockedUntil: new Date(Date.now() + 60 * 1000), // locked for 1 more minute
    });

    const result = await authorize({ email: "x@example.com", password: "correct-password" });
    expect(result).toBeNull();
    // No update — we don't bump the counter while locked.
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("allows login once lockedUntil is in the past", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockFindUnique.mockResolvedValue({
      id: "u1",
      email: "x@example.com",
      displayName: "X",
      passwordHash,
      failedLoginAttempts: 5,
      lockedUntil: new Date(Date.now() - 60 * 1000), // expired 1 minute ago
    });
    mockUpdate.mockResolvedValue({});

    const result = await authorize({ email: "x@example.com", password: "correct-password" });
    expect(result).toMatchObject({ id: "u1", email: "x@example.com" });
    // Success resets the counter and clears lockedUntil.
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  });

  it("does not write to the DB on a successful login when counters are already clean", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 12);
    mockFindUnique.mockResolvedValue({
      id: "u1",
      email: "x@example.com",
      displayName: "X",
      passwordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

    const result = await authorize({ email: "x@example.com", password: "correct-password" });
    expect(result).toMatchObject({ id: "u1" });
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe("authorize() timing equivalence (smoke check)", () => {
  // We're not asserting hard-millisecond bounds (CI noise makes that flaky),
  // but we *do* assert that the not-found path runs bcrypt.compare. If a
  // future refactor short-circuits before bcrypt runs, this test fails.
  let authorize: (creds: unknown) => Promise<unknown>;

  beforeEach(() => {
    mockFindUnique.mockReset();
    mockUpdate.mockReset();
    authorize = getCredentialsAuthorize();
  });

  it("not-found path still takes meaningful time (bcrypt cost paid)", async () => {
    mockFindUnique.mockResolvedValue(null);
    const t0 = Date.now();
    await authorize({ email: "absent@example.com", password: "anything" });
    const elapsed = Date.now() - t0;
    // bcrypt rounds=12 is ~150-400ms; if the not-found path skips bcrypt,
    // this would be <10ms.
    expect(elapsed).toBeGreaterThan(50);
  });
});
