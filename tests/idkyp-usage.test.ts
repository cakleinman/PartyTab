import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    idkypUsage: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/entitlements", () => ({
  canUseProFeatures: vi.fn(),
}));

import {
  IDKYP_FREE_MONTHLY_LIMIT,
  getIdkypQuotaInfo,
  incrementIdkypUsage,
} from "../lib/idkyp/usage";
import { prisma } from "@/lib/db/prisma";
import { canUseProFeatures } from "@/lib/auth/entitlements";

describe("IDKYP usage constants", () => {
  it("exposes the free monthly limit of 4", () => {
    expect(IDKYP_FREE_MONTHLY_LIMIT).toBe(4);
  });
});

describe("getIdkypQuotaInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unlimited for Pro users", async () => {
    vi.mocked(canUseProFeatures).mockResolvedValue(true);
    vi.mocked(prisma.idkypUsage.findUnique).mockResolvedValue({
      id: "u1",
      userId: "user-1",
      month: "2026-05",
      count: 7,
      updatedAt: new Date(),
    });
    const info = await getIdkypQuotaInfo("user-1");
    expect(info.unlimited).toBe(true);
    expect(info.used).toBe(7);
    expect(info.remaining).toBe(Infinity);
  });

  it("counts down from the free limit for non-Pro users", async () => {
    vi.mocked(canUseProFeatures).mockResolvedValue(false);
    vi.mocked(prisma.idkypUsage.findUnique).mockResolvedValue({
      id: "u1",
      userId: "user-1",
      month: "2026-05",
      count: 3,
      updatedAt: new Date(),
    });
    const info = await getIdkypQuotaInfo("user-1");
    expect(info.unlimited).toBe(false);
    expect(info.limit).toBe(IDKYP_FREE_MONTHLY_LIMIT);
    expect(info.used).toBe(3);
    expect(info.remaining).toBe(1);
  });

  it("clamps remaining at 0 when over the free limit", async () => {
    vi.mocked(canUseProFeatures).mockResolvedValue(false);
    vi.mocked(prisma.idkypUsage.findUnique).mockResolvedValue({
      id: "u1",
      userId: "user-1",
      month: "2026-05",
      count: 9,
      updatedAt: new Date(),
    });
    const info = await getIdkypQuotaInfo("user-1");
    expect(info.remaining).toBe(0);
  });

  it("treats missing row as 0 used", async () => {
    vi.mocked(canUseProFeatures).mockResolvedValue(false);
    vi.mocked(prisma.idkypUsage.findUnique).mockResolvedValue(null);
    const info = await getIdkypQuotaInfo("user-1");
    expect(info.used).toBe(0);
    expect(info.remaining).toBe(IDKYP_FREE_MONTHLY_LIMIT);
  });
});

describe("incrementIdkypUsage", () => {
  it("upserts the current month with count=1 on create and increment on update", async () => {
    vi.mocked(prisma.idkypUsage.upsert).mockResolvedValue({
      id: "u1",
      userId: "user-1",
      month: "2026-05",
      count: 1,
      updatedAt: new Date(),
    });
    await incrementIdkypUsage("user-1");
    expect(prisma.idkypUsage.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ count: 1 }),
        update: expect.objectContaining({ count: { increment: 1 } }),
      }),
    );
  });
});
