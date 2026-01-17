import { prisma } from "@/lib/db/prisma";
import { NotificationType } from "@prisma/client";

export async function createInAppNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  url?: string
) {
  return prisma.inAppNotification.create({
    data: { userId, type, title, body, url }
  });
}
