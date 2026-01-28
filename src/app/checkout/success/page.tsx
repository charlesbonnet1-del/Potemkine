'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { PlanType } from '@/types';
import { PLANS } from '@/lib/plans';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, upgradePlan } = useAuth();
  const { track } = useAnalytics();
  const [activated, setActivated] = useState(false);

  const planId = searchParams.get('plan') as PlanType | null;
  const sessionId = searchParams.get('session_id');
  const plan = PLANS.find(p => p.id === planId);

  useEffect(() => {
    if (planId && sessionId && !activated) {
      // Activate subscription locally
      upgradePlan(planId);
      track('signup_completed', { plan: planId, stripeSessionId: sessionId });
      setActivated(true);
    }
  }, [planId, sessionId, activated, upgradePlan, track]);

  useEffect(() => {
    // Redirect to dashboard after a delay
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paiement confirmé !</h1>
          <p className="mt-2 text-gray-600">
            Votre abonnement {plan?.name || ''} est maintenant actif.
          </p>
        </div>

        {plan && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Plan {plan.name}</p>
                <p className="text-sm text-gray-500">{plan.price}€/mois</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                Actif
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Votre essai gratuit de 14 jours commence maintenant.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link href="/dashboard">
            <Button className="w-full">
              Accéder au tableau de bord
            </Button>
          </Link>
          <p className="text-sm text-gray-500">
            Redirection automatique dans quelques secondes...
          </p>
        </div>

        {user && (
          <p className="text-xs text-gray-400">
            Connecté en tant que {user.email}
          </p>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
