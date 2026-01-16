import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { syncSubscription } from "@/lib/stripe/billing";
import { prisma } from "@/lib/db/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  // Use PROD secret if available, else local
  // Logic: In prod, STRIPE_WEBHOOK_SECRET_PROD should be set. In dev, STRIPE_WEBHOOK_SECRET.
  // We can try one, if it fails try the other? Or just prefer PROD if present.
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_PROD || process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  try {
    // Record event with upsert for idempotency (handles duplicate webhooks)
    await prisma.stripeEvent.upsert({
      where: { eventId: event.id },
      create: {
        eventId: event.id,
        type: event.type,
      },
      update: {
        type: event.type, // Update type in case it changed (unlikely)
      },
    });

    // Handle events
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription, event.id);
        break;

      case "checkout.session.completed":
        // Usually we rely on subscription.created, but if we need to do one-off setup, do it here.
        // For subscription mode, subscription.created fires too.
        // We can ignore this for now unless we need to fulfill non-subscription items.
        break;

      case "invoice.paid":
      case "invoice.payment_failed":
        // Subscription status updates will handle the entitlement logic via subscription.updated
        // But we might want to log these or send emails in future.
        // For now, syncSubscription handles the status change (e.g. past_due).
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } };
        if (invoice.subscription) {
           const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
           const sub = await stripe.subscriptions.retrieve(subId);
           await syncSubscription(sub, event.id);
        }
        break;

      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    // Return 200 to acknowledge receipt so Stripe doesn't retry infinitely if it's a logic error on our end?
    // Or 500 to retry? Standard is 500 to retry.
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
