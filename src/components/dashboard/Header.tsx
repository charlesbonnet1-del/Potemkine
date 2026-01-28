'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function Header({ title }: { title: string }) {
  const { user, getTrialDaysRemaining, isTrialExpiringSoon } = useAuth();
  const trialDays = getTrialDaysRemaining();
  const subscription = user?.subscription;

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Trial warning */}
        {subscription?.status === 'trialing' && trialDays !== null && (
          <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${isTrialExpiringSoon() ? 'bg-red-50' : 'bg-blue-50'}`}>
            <span className={`text-sm font-medium ${isTrialExpiringSoon() ? 'text-red-700' : 'text-blue-700'}`}>
              {trialDays > 0 ? `${trialDays} jours restants` : 'Essai expiré'}
            </span>
            <Link href="/dashboard/settings/billing">
              <Button size="sm" variant={isTrialExpiringSoon() ? 'danger' : 'primary'}>
                Upgrader
              </Button>
            </Link>
          </div>
        )}

        {/* Payment failed warning */}
        {subscription?.status === 'past_due' && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5">
            <span className="text-sm font-medium text-red-700">Paiement échoué</span>
            <Link href="/dashboard/settings/billing">
              <Button size="sm" variant="danger">Mettre à jour</Button>
            </Link>
          </div>
        )}

        {/* Subscription status badge */}
        <Badge
          variant={
            subscription?.status === 'active' ? 'success' :
            subscription?.status === 'trialing' ? 'info' :
            subscription?.status === 'past_due' ? 'danger' :
            subscription?.status === 'canceling' ? 'warning' : 'default'
          }
        >
          {subscription?.planId?.toUpperCase() || 'FREE'}
        </Badge>
      </div>
    </header>
  );
}
