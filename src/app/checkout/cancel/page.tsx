'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PLANS } from '@/lib/plans';
import { PlanType } from '@/types';

function CheckoutCancelContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') as PlanType | null;
  const plan = PLANS.find(p => p.id === planId);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
          <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paiement annulé</h1>
          <p className="mt-2 text-gray-600">
            Vous avez annulé le processus de paiement. Aucun montant n&apos;a été débité.
          </p>
        </div>

        {plan && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-left">
            <p className="font-semibold text-gray-900">Plan {plan.name} - {plan.price}€/mois</p>
            <p className="text-sm text-gray-500 mt-1">
              Vous pouvez reprendre votre inscription à tout moment.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link href={`/signup?plan=${planId || 'pro'}`}>
            <Button className="w-full">
              Réessayer
            </Button>
          </Link>
          <Link href="/#pricing">
            <Button variant="outline" className="w-full">
              Voir les autres plans
            </Button>
          </Link>
          <Link href="/" className="block text-sm text-gray-500 hover:text-gray-700">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-yellow-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <CheckoutCancelContent />
    </Suspense>
  );
}
