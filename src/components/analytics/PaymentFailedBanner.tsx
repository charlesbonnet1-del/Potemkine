'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useEffect } from 'react';

export function PaymentFailedBanner() {
  const { user } = useAuth();
  const { track } = useAnalytics();

  useEffect(() => {
    if (user?.subscription.status === 'past_due') {
      track('payment_failed', {
        retryCount: user.subscription.paymentRetryCount,
        failedAt: user.subscription.paymentFailedAt,
      });
    }
  }, [user?.subscription.status, user?.subscription.paymentRetryCount, user?.subscription.paymentFailedAt, track]);

  if (!user || user.subscription.status !== 'past_due') {
    return null;
  }

  return (
    <div className="bg-red-600 text-white px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium">Paiement échoué</p>
            <p className="text-sm text-red-100">
              Nous n&apos;avons pas pu traiter votre paiement. Veuillez mettre à jour vos informations.
            </p>
          </div>
        </div>
        <Link href="/dashboard/settings/billing">
          <Button variant="secondary" size="sm">Mettre à jour le paiement</Button>
        </Link>
      </div>
    </div>
  );
}
