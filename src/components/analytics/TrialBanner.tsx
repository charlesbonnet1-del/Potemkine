'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function TrialBanner() {
  const { user, getTrialDaysRemaining, isTrialExpiringSoon } = useAuth();
  const { track } = useAnalytics();
  const [dismissed, setDismissed] = useState(false);

  const trialDays = getTrialDaysRemaining();
  const expiringSoon = isTrialExpiringSoon();

  useEffect(() => {
    if (expiringSoon && trialDays !== null && trialDays > 0) {
      track('trial_expiring_soon', { daysRemaining: trialDays });
    } else if (trialDays !== null && trialDays <= 0) {
      track('trial_expired');
    }
  }, [expiringSoon, trialDays, track]);

  if (!user || user.subscription.status !== 'trialing' || dismissed || trialDays === null) {
    return null;
  }

  if (trialDays <= 0) {
    return (
      <div className="bg-red-600 text-white px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium">Votre période d&apos;essai est terminée. Passez à un plan payant pour continuer.</p>
          </div>
          <Link href="/dashboard/settings/billing">
            <Button variant="secondary" size="sm">Choisir un plan</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (expiringSoon) {
    return (
      <div className="bg-yellow-500 text-yellow-900 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">
              Plus que {trialDays} jour{trialDays > 1 ? 's' : ''} d&apos;essai gratuit !
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/settings/billing">
              <Button variant="primary" size="sm">Upgrader maintenant</Button>
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-yellow-600/20 rounded"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
