import { prisma } from "@/lib/db/prisma";
import { canUseProFeatures } from "@/lib/auth/entitlements";
import type { IdkypUsageInfo } from "./types";

export const IDKYP_FREE_MONTHLY_LIMIT = 4;

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function getIdkypUsageCount(userId: string): Promise<number> {
  const usage = await prisma.idkypUsage.findUnique({
    where: { userId_month: { userId, month: currentMonth() } },
  });
  return usage?.count ?? 0;
}

export async function incrementIdkypUsage(userId: string): Promise<void> {
  const month = currentMonth();
  await prisma.idkypUsage.upsert({
    where: { userId_month: { userId, month } },
    create: { userId, month, count: 1 },
    update: { count: { increment: 1 } },
  });
}

export async function getIdkypQuotaInfo(userId: string): Promise<IdkypUsageInfo> {
  const [used, isPro] = await Promise.all([getIdkypUsageCount(userId), canUseProFeatures(userId)]);
  if (isPro) {
    return { used, limit: Infinity, remaining: Infinity, unlimited: true };
  }
  return {
    used,
    limit: IDKYP_FREE_MONTHLY_LIMIT,
    remaining: Math.max(0, IDKYP_FREE_MONTHLY_LIMIT - used),
    unlimited: false,
  };
}

export async function checkIdkypLimit(userId: string): Promise<void> {
  const info = await getIdkypQuotaInfo(userId);
  if (!info.unlimited && info.remaining <= 0) {
    throw new Error(`Monthly IDKYP decision limit exceeded (${info.limit}/month).`);
  }
}
