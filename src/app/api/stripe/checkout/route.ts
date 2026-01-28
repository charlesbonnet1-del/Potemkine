import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';
import { PLANS } from '@/lib/plans';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, email, userId } = body as {
      planId: 'starter' | 'pro' | 'enterprise';
      email: string;
      userId: string;
    };

    if (!planId || !email || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Récupérer les infos du plan
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    const stripe = getStripeServer();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Créer ou récupérer le customer Stripe
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    // Créer la session Checkout avec price_data inline (pas besoin de pré-créer les produits)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `TaskFlow ${plan.name}`,
              description: `Abonnement mensuel au plan ${plan.name}`,
            },
            unit_amount: plan.price * 100, // Stripe utilise les centimes
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      // 14 jours d'essai gratuit
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId,
          planId,
        },
      },
      success_url: `${appUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/settings/billing?checkout=cancelled`,
      metadata: {
        userId,
        planId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
