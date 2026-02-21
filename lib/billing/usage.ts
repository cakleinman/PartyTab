import { prisma } from "@/lib/db/prisma";
import { requirePro } from "@/lib/auth/entitlements";

export async function getReceiptUsage(userId: string) {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const usage = await prisma.receiptUsage.findUnique({
    where: {
      userId_month: {
        userId,
        month,
      },
    },
  });

  return usage?.count ?? 0;
}

export async function incrementReceiptUsage(userId: string) {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  await prisma.receiptUsage.upsert({
    where: {
      userId_month: {
        userId,
        month,
      },
    },
    create: {
      userId,
      month,
      count: 1,
    },
    update: {
      count: {
        increment: 1,
      },
    },
  });
}

export async function getReceiptLimit(userId: string): Promise<number> {
  const isPro = await requirePro(userId);
  return isPro ? 15 : 2;
}

export async function checkReceiptLimit(userId: string, limit?: number) {
  const maxLimit = limit ?? 15;
  const count = await getReceiptUsage(userId);
  if (count >= maxLimit) {
    throw new Error(`Monthly receipt parsing limit exceeded (${maxLimit}/month).`);
  }
}

export async function getReceiptQuotaInfo(
  userId: string
): Promise<{ used: number; limit: number; remaining: number }> {
  const [used, limit] = await Promise.all([getReceiptUsage(userId), getReceiptLimit(userId)]);
  return { used, limit, remaining: Math.max(0, limit - used) };
}
