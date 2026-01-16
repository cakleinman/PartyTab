import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  // In production this should crash, but in build/dev without keys it might warn.
  // We'll throw if used.
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'mock_key_for_build', {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});
