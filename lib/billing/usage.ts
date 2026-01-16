import { prisma } from "@/lib/db/prisma";

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

export async function checkReceiptLimit(userId: string, limit = 15) {
  const count = await getReceiptUsage(userId);
  if (count >= limit) {
    throw new Error("Monthly receipt parsing limit exceeded (15/month).");
  }
}
