'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CancellationModal } from '@/components/analytics/CancellationModal';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { PLANS, getPlan } from '@/lib/plans';
import { formatDate } from '@/lib/utils';

export default function BillingPage() {
  const {
    user,
    upgradePlan,
    reactivateSubscription,
    simulatePaymentFailure,
    recoverPayment,
    getTrialDaysRemaining,
  } = useAuth();
  const { track } = useAnalytics();
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    track('page_view', { page: 'billing' });
  }, [track]);

  if (!user) return null;

  const currentPlan = getPlan(user.subscription.planId);
  const subscription = user.subscription;
  const trialDays = getTrialDaysRemaining();

  const handleUpgrade = (planId: string) => {
    const oldPlan = subscription.planId;
    upgradePlan(planId as 'starter' | 'pro' | 'enterprise');

    if (PLANS.findIndex(p => p.id === planId) > PLANS.findIndex(p => p.id === oldPlan)) {
      track('subscription_upgraded', { from: oldPlan, to: planId });
    } else {
      track('subscription_downgraded', { from: oldPlan, to: planId });
    }
  };

  const handleReactivate = () => {
    reactivateSubscription();
    track('cancellation_prevented', { action: 'reactivated' });
  };

  const handleRecoverPayment = () => {
    recoverPayment();
    track('payment_recovered');
  };

  return (
    <div>
      <Header title="Abonnement et facturation" />

      <div className="p-6 max-w-4xl space-y-6">
        {/* Current subscription */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Abonnement actuel</h2>
            <Badge
              variant={
                subscription.status === 'active' ? 'success' :
                subscription.status === 'trialing' ? 'info' :
                subscription.status === 'past_due' ? 'danger' :
                subscription.status === 'canceling' ? 'warning' : 'default'
              }
            >
              {subscription.status === 'active' ? 'Actif' :
               subscription.status === 'trialing' ? 'Période d\'essai' :
               subscription.status === 'past_due' ? 'Paiement en retard' :
               subscription.status === 'canceling' ? 'Annulation prévue' :
               subscription.status === 'canceled' ? 'Annulé' : subscription.status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{currentPlan?.name}</h3>
                <p className="text-gray-500">{currentPlan?.price}€ / mois</p>
              </div>
              <div className="text-right">
                {subscription.status === 'trialing' && trialDays !== null && (
                  <p className={`font-medium ${trialDays <= 3 ? 'text-red-600' : 'text-blue-600'}`}>
                    {trialDays > 0 ? `${trialDays} jours d'essai restants` : 'Essai expiré'}
                  </p>
                )}
                {subscription.status === 'active' && (
                  <p className="text-gray-500">
                    Prochain paiement: {formatDate(subscription.currentPeriodEnd)}
                  </p>
                )}
                {subscription.status === 'canceling' && (
                  <p className="text-yellow-600">
                    Actif jusqu&apos;au {formatDate(subscription.currentPeriodEnd)}
                  </p>
                )}
              </div>
            </div>

            {/* Payment failed warning */}
            {subscription.status === 'past_due' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-1">Paiement échoué</h4>
                <p className="text-sm text-red-700 mb-3">
                  Nous n&apos;avons pas pu traiter votre dernier paiement.
                  {subscription.paymentRetryCount && ` (tentative ${subscription.paymentRetryCount}/3)`}
                </p>
                <Button variant="danger" onClick={handleRecoverPayment}>
                  Mettre à jour le paiement
                </Button>
              </div>
            )}

            {/* Cancellation pending */}
            {subscription.status === 'canceling' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-1">Annulation programmée</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Votre abonnement sera annulé à la fin de la période de facturation actuelle.
                </p>
                <Button variant="primary" onClick={handleReactivate}>
                  Annuler la demande d&apos;annulation
                </Button>
              </div>
            )}

            {/* Actions */}
            {subscription.status !== 'canceling' && subscription.status !== 'canceled' && (
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowCancelModal(true)}>
                  Annuler l&apos;abonnement
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plans comparison */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Changer de plan</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan) => {
                const isCurrent = plan.id === subscription.planId;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-lg border p-4 ${
                      isCurrent ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                      {isCurrent && (
                        <Badge variant="info">Actuel</Badge>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-4">
                      {plan.price}€<span className="text-sm font-normal text-gray-500">/mois</span>
                    </p>
                    <ul className="space-y-2 mb-4">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {!isCurrent && (
                      <Button
                        variant={plan.id === 'pro' ? 'primary' : 'outline'}
                        className="w-full"
                        onClick={() => handleUpgrade(plan.id)}
                      >
                        {PLANS.findIndex(p => p.id === plan.id) > PLANS.findIndex(p => p.id === subscription.planId)
                          ? 'Passer au plan'
                          : 'Rétrograder'}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Demo controls */}
        <Card className="border-dashed">
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700">Contrôles de démo</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Ces contrôles permettent de simuler différents scénarios d&apos;abonnement pour tester l&apos;application.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={simulatePaymentFailure}>
                Simuler paiement échoué
              </Button>
              <Button variant="outline" size="sm" onClick={handleRecoverPayment}>
                Simuler récupération paiement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <CancellationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
      />
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
