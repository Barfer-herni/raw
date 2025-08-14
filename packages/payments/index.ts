import 'server-only';
import Stripe from 'stripe';
import { keys } from './keys';

// During build time, use a dummy key to prevent errors
// At runtime, the real key will be used
const stripeKey = process.env.NODE_ENV === 'production' && !process.env.STRIPE_SECRET_KEY
  ? 'sk_test_dummy_key_for_build'
  : keys().STRIPE_SECRET_KEY ?? '';

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-02-24.acacia',
});

export type { Stripe } from 'stripe';
