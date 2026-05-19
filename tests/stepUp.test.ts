import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

const mockFindUnique = vi.fn();
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

const mockCookieGet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => mockCookieGet(name),
  }),
}));

import bcrypt from "bcrypt";
import { requireStepUp } from "@/lib/auth/stepUp";
import { isApiError } from "@/lib/api/errors";
import { STEP_UP_COOKIE, serializeStepUp } from "@/lib/auth/stepUpCookie";

beforeAll(() => {
  // serializeStepUp requires SESSION_SECRET >= 32 chars.
  process.env.SESSION_SECRET = "x".repeat(48);
});

describe("requireStepUp", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
    mockCookieGet.mockReset();
    mockCookieGet.mockReturnValue(undefined);
  });

  it("passes for an email user with the correct password", async () => {
    const hash = await bcrypt.hash("correct", 12);
    mockFindUnique.mockResolvedValue({ passwordHash: hash });
    await expect(
      requireStepUp({
        userId: "u1",
        authProvider: "EMAIL",
        currentPassword: "correct",
      }),
    ).resolves.toBeUndefined();
  });

  it("throws 401 unauthorized when an email user omits currentPassword", async () => {
    const hash = await bcrypt.hash("correct", 12);
    mockFindUnique.mockResolvedValue({ passwordHash: hash });
    try {
      await requireStepUp({
        userId: "u1",
        authProvider: "EMAIL",
        currentPassword: null,
      });
      throw new Error("should have thrown");
    } catch (e) {
      expect(isApiError(e)).toBe(true);
      if (isApiError(e)) {
        expect(e.status).toBe(401);
        expect(e.code).toBe("unauthorized");
      }
    }
  });

  it("throws 403 forbidden when an email user supplies the wrong password", async () => {
    const hash = await bcrypt.hash("correct", 12);
    mockFindUnique.mockResolvedValue({ passwordHash: hash });
    try {
      await requireStepUp({
        userId: "u1",
        authProvider: "EMAIL",
        currentPassword: "wrong",
      });
      throw new Error("should have thrown");
    } catch (e) {
      expect(isApiError(e)).toBe(true);
      if (isApiError(e)) {
        expect(e.status).toBe(403);
        expect(e.code).toBe("forbidden");
      }
    }
  });

  it("passes for a Google user with a valid step-up cookie", async () => {
    mockFindUnique.mockResolvedValue({ passwordHash: null });
    const cookieValue = serializeStepUp({ userId: "u1", iat: Date.now() });
    mockCookieGet.mockImplementation((name: string) =>
      name === STEP_UP_COOKIE ? { value: cookieValue } : undefined,
    );
    await expect(
      requireStepUp({
        userId: "u1",
        authProvider: "GOOGLE",
        currentPassword: null,
      }),
    ).resolves.toBeUndefined();
  });

  it("throws 412 step_up_required for a Google user with no cookie", async () => {
    mockFindUnique.mockResolvedValue({ passwordHash: null });
    try {
      await requireStepUp({
        userId: "u1",
        authProvider: "GOOGLE",
        currentPassword: null,
      });
      throw new Error("should have thrown");
    } catch (e) {
      expect(isApiError(e)).toBe(true);
      if (isApiError(e)) {
        expect(e.status).toBe(412);
        expect(e.code).toBe("step_up_required");
        expect(e.details).toEqual({ method: "google_oauth" });
      }
    }
  });

  it("throws 412 for a Google user with an expired step-up cookie", async () => {
    mockFindUnique.mockResolvedValue({ passwordHash: null });
    const expiredIat = Date.now() - 6 * 60 * 1000; // 6 minutes ago — beyond 5min TTL
    const cookieValue = serializeStepUp({ userId: "u1", iat: expiredIat });
    mockCookieGet.mockImplementation((name: string) =>
      name === STEP_UP_COOKIE ? { value: cookieValue } : undefined,
    );
    try {
      await requireStepUp({
        userId: "u1",
        authProvider: "GOOGLE",
        currentPassword: null,
      });
      throw new Error("should have thrown");
    } catch (e) {
      expect(isApiError(e)).toBe(true);
      if (isApiError(e)) {
        expect(e.status).toBe(412);
        expect(e.code).toBe("step_up_required");
      }
    }
  });

  it("throws 412 when the step-up cookie is signed for a different userId", async () => {
    mockFindUnique.mockResolvedValue({ passwordHash: null });
    const cookieValue = serializeStepUp({ userId: "attacker", iat: Date.now() });
    mockCookieGet.mockImplementation((name: string) =>
      name === STEP_UP_COOKIE ? { value: cookieValue } : undefined,
    );
    try {
      await requireStepUp({
        userId: "u1",
        authProvider: "GOOGLE",
        currentPassword: null,
      });
      throw new Error("should have thrown");
    } catch (e) {
      expect(isApiError(e)).toBe(true);
      if (isApiError(e)) {
        expect(e.status).toBe(412);
        expect(e.code).toBe("step_up_required");
      }
    }
  });

  it("falls through silently for unexpected auth providers (defensive)", async () => {
    mockFindUnique.mockResolvedValue({ passwordHash: null });
    // Guest users shouldn't reach here, but if they do, requireStepUp must
    // not throw — callers always reject guests upstream with their own check.
    await expect(
      requireStepUp({
        userId: "u1",
        authProvider: "GUEST",
        currentPassword: null,
      }),
    ).resolves.toBeUndefined();
  });
});
