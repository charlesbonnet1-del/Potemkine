import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, email, userId } = body;

    if (!planId || !STRIPE_PRICE_IDS[planId]) {
      return NextResponse.json(
        { error: 'Plan invalide' },
        { status: 400 }
      );
    }

    const priceId = STRIPE_PRICE_IDS[planId];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create or retrieve Stripe customer
    let customerId: string | undefined;
    if (email) {
      const existingCustomers = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email,
          metadata: { userId: userId || '' },
        });
        customerId = customer.id;
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      customer_email: !customerId ? email : undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${appUrl}/checkout/cancel?plan=${planId}`,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          planId,
          userId: userId || '',
        },
      },
      metadata: {
        planId,
        userId: userId || '',
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}
