import { prisma } from "@/lib/db/prisma";

export type EntitlementState = "FREE" | "PRO_ACTIVE" | "PRO_PAST_DUE" | "PRO_CANCELED";

export async function getEntitlement(userId: string): Promise<EntitlementState> {
  const entitlement = await prisma.entitlement.findUnique({
    where: { userId },
  });

  if (!entitlement) return "FREE";
  return entitlement.state as EntitlementState;
}

export async function requirePro(userId: string): Promise<boolean> {
  const state = await getEntitlement(userId);
  return ["PRO_ACTIVE", "PRO_PAST_DUE"].includes(state);
}

/**
 * Checks if user is eligible for parsing (Pro feature).
 * This also checks usage limits, but that's a separate concern.
 * For now, this just checks Pro status.
 */
export async function canUseProFeatures(userId: string): Promise<boolean> {
  return requirePro(userId);
}
