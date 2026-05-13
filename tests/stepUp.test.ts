import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

import bcrypt from "bcrypt";
import { requireStepUp } from "@/lib/auth/stepUp";
import { isApiError } from "@/lib/api/errors";

describe("requireStepUp", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
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

  it("allows Google users through (no password to verify)", async () => {
    mockFindUnique.mockResolvedValue({ passwordHash: null });
    // Pre-change behaviour: Google users had no step-up at all. Keeping that
    // status quo until a passkey-assertion step-up cookie ships, so existing
    // Google users with saved Venmo handles aren't locked out on deploy.
    await expect(
      requireStepUp({
        userId: "u1",
        authProvider: "GOOGLE",
        currentPassword: null,
      }),
    ).resolves.toBeUndefined();
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
