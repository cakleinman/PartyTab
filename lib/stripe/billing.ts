import { stripe } from "./client";
import { prisma } from "@/lib/db/prisma";
import { Stripe } from "stripe";

const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  annual: process.env.STRIPE_PRICE_PRO_ANNUAL,
};

const BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000";

/**
 * Creates or retrieves a Stripe Customer for a given User.
 */
async function getOrCreateStripeCustomer(userId: string, email: string) {
  const existing = await prisma.stripeCustomer.findUnique({
    where: { userId },
  });

  if (existing) {
    return existing.stripeCustomerId;
  }

  // Create new customer in Stripe
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  // Store mapping
  await prisma.stripeCustomer.create({
    data: {
      userId,
      stripeCustomerId: customer.id,
    },
  });

  return customer.id;
}

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  plan: "monthly" | "annual"
) {
  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    throw new Error(`Price ID not configured for plan: ${plan}`);
  }

  const customerId = await getOrCreateStripeCustomer(userId, userEmail);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: userId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { userId },
    },
    success_url: `${BASE_URL}/tabs?success=true`,
    cancel_url: `${BASE_URL}/upgrade?canceled=true`,
  });

  return session.url;
}

export async function createPortalSession(userId: string) {
  const customerRecord = await prisma.stripeCustomer.findUnique({
    where: { userId },
  });

  if (!customerRecord) {
    throw new Error("No billing account found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerRecord.stripeCustomerId,
    return_url: `${BASE_URL}/tabs`,
  });

  return session.url;
}

/**
 * Syncs Stripe Subscription status to our DB (Entitlements + StripeSubscription).
 */
export async function syncSubscription(
  subscription: Stripe.Subscription,
) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("Subscription missing userId metadata", subscription.id);
    return;
  }

  // Map Stripe status to Entitlement state
  // Rules:
  // active => PRO_ACTIVE
  // past_due, unpaid => PRO_PAST_DUE
  // canceled, incomplete_expired => PRO_CANCELED
  // cancel_at_period_end=true => remain PRO_ACTIVE until end

  let entitlementState = "FREE";

  if (["active", "trialing"].includes(subscription.status)) {
    entitlementState = "PRO_ACTIVE";
  } else if (["past_due", "unpaid"].includes(subscription.status)) {
    entitlementState = "PRO_PAST_DUE";
  } else {
    entitlementState = "PRO_CANCELED";
  }

  // Upsert StripeSubscription record
  // Cast to access period properties (they exist on active subscriptions)
  const sub = subscription as Stripe.Subscription & {
    current_period_start: number;
    current_period_end: number;
  };
  const currentPeriodStart = sub.current_period_start
    ? new Date(sub.current_period_start * 1000)
    : new Date();
  const currentPeriodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : new Date();

  await prisma.stripeSubscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id || "",
      stripeStatus: subscription.status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      stripeStatus: subscription.status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  // Upsert Entitlement
  await prisma.entitlement.upsert({
    where: { userId },
    create: {
      userId,
      plan: entitlementState === "PRO_CANCELED" ? "FREE" : "PRO",
      state: entitlementState,
      effectiveAt: new Date(),
      expiresAt: currentPeriodEnd,
    },
    update: {
      plan: entitlementState === "PRO_CANCELED" ? "FREE" : "PRO",
      state: entitlementState,
      expiresAt: currentPeriodEnd,
    },
  });
}
