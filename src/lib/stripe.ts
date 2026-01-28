import Stripe from 'stripe';

// Server-side Stripe instance - lazy initialization
let stripeInstance: Stripe | null = null;

export function getStripeServer(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// Alias for backward compatibility
export const stripe = {
  get instance() {
    return getStripeServer();
  },
};

// Prix IDs Stripe - à remplacer par vos IDs créés dans le dashboard Stripe
// Créez les produits sur https://dashboard.stripe.com/test/products
export const STRIPE_PRICES = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || 'price_starter_yearly',
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
    yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || 'price_enterprise_yearly',
  },
} as const;

export type PlanId = keyof typeof STRIPE_PRICES;
export type BillingInterval = 'monthly' | 'yearly';

export function getPriceId(planId: PlanId, interval: BillingInterval = 'monthly'): string {
  return STRIPE_PRICES[planId][interval];
}
