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
    reactivateSubscription,
    simulatePaymentFailure,
    recoverPayment,
    getTrialDaysRemaining,
  } = useAuth();
  const { track } = useAnalytics();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    track('page_view', { page: 'billing' });
  }, [track]);

  if (!user) return null;

  const currentPlan = getPlan(user.subscription.planId);
  const subscription = user.subscription;
  const trialDays = getTrialDaysRemaining();

  // Payer via Stripe Checkout
  const handleStripeCheckout = async (planId: string) => {
    setIsLoading(planId);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          email: user.email,
          userId: user.id,
        }),
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);

      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Impossible de créer la session de paiement. Vérifiez que les clés Stripe sont configurées.');
    } finally {
      setIsLoading(null);
    }
  };

  // Ouvrir le portail client Stripe
  const handleOpenStripePortal = async () => {
    if (!user.stripeCustomerId) {
      alert('Aucun compte Stripe associé. Souscrivez d\'abord à un plan via Stripe.');
      return;
    }

    setIsLoading('portal');
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: user.stripeCustomerId }),
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);

      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
      alert('Impossible d\'ouvrir le portail Stripe');
    } finally {
      setIsLoading(null);
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
            <div className="flex gap-3 pt-2">
              {user.stripeCustomerId && (
                <Button
                  variant="outline"
                  onClick={handleOpenStripePortal}
                  disabled={isLoading === 'portal'}
                >
                  {isLoading === 'portal' ? 'Chargement...' : 'Gérer sur Stripe'}
                </Button>
              )}
              {subscription.status !== 'canceling' && subscription.status !== 'canceled' && (
                <Button variant="outline" onClick={() => setShowCancelModal(true)}>
                  Annuler l&apos;abonnement
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plans - Stripe Checkout direct */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <StripeIcon className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Choisir un plan</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Cliquez sur un plan pour payer directement via Stripe (mode test)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan) => {
                const isCurrent = plan.id === subscription.planId;
                const loading = isLoading === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-lg border p-4 ${
                      isCurrent ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    } transition-colors`}
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
                    <Button
                      variant={plan.id === 'pro' ? 'primary' : 'outline'}
                      className="w-full"
                      onClick={() => handleStripeCheckout(plan.id)}
                      disabled={loading || isCurrent}
                    >
                      {loading ? (
                        'Redirection...'
                      ) : isCurrent ? (
                        'Plan actuel'
                      ) : (
                        <>
                          <StripeIcon className="h-4 w-4 mr-2" />
                          Payer {plan.price}€/mois
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Carte de test: 4242 4242 4242 4242 • Date: future • CVC: 123
            </p>
          </CardContent>
        </Card>

        {/* Demo controls */}
        <Card className="border-dashed border-gray-300">
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700">Contrôles de démo (simulation locale)</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Ces contrôles simulent des scénarios sans passer par Stripe.
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

function StripeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
    </svg>
  );
}
