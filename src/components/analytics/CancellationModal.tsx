'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { getPlan } from '@/lib/plans';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const cancellationReasons = [
  { id: 'too_expensive', label: 'Trop cher' },
  { id: 'not_using', label: 'Je ne l\'utilise pas assez' },
  { id: 'missing_features', label: 'Fonctionnalités manquantes' },
  { id: 'switching', label: 'Je passe à un autre outil' },
  { id: 'temporary', label: 'Pause temporaire' },
  { id: 'other', label: 'Autre raison' },
];

export function CancellationModal({ isOpen, onClose }: CancellationModalProps) {
  const { user, cancelSubscription } = useAuth();
  const { track } = useAnalytics();
  const [step, setStep] = useState<'reason' | 'offer' | 'confirm'>('reason');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [feedback, setFeedback] = useState('');

  const currentPlan = user ? getPlan(user.subscription.planId) : null;

  const handleReasonSubmit = () => {
    track('cancellation_initiated', { reason: selectedReason, feedback });

    // Show retention offer for certain reasons
    if (['too_expensive', 'not_using', 'temporary'].includes(selectedReason)) {
      setStep('offer');
    } else {
      setStep('confirm');
    }
  };

  const handleAcceptOffer = () => {
    track('cancellation_prevented', { reason: selectedReason, acceptedOffer: true });
    onClose();
    setStep('reason');
    setSelectedReason('');
    setFeedback('');
  };

  const handleConfirmCancel = () => {
    track('cancellation_completed', { reason: selectedReason, feedback });
    cancelSubscription();
    onClose();
    setStep('reason');
    setSelectedReason('');
    setFeedback('');
  };

  const handleClose = () => {
    onClose();
    setStep('reason');
    setSelectedReason('');
    setFeedback('');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Annuler l'abonnement" size="lg">
      {step === 'reason' && (
        <div className="space-y-4">
          <p className="text-gray-600">
            Nous sommes désolés de vous voir partir. Pourriez-vous nous dire pourquoi ?
          </p>

          <div className="space-y-2">
            {cancellationReasons.map((reason) => (
              <label
                key={reason.id}
                className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  selectedReason === reason.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason.id}
                  checked={selectedReason === reason.id}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-gray-900">{reason.label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commentaire (optionnel)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Partagez vos suggestions..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Garder mon abonnement
            </Button>
            <Button
              variant="danger"
              onClick={handleReasonSubmit}
              disabled={!selectedReason}
            >
              Continuer
            </Button>
          </div>
        </div>
      )}

      {step === 'offer' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Offre spéciale pour vous</h3>
            <p className="text-blue-800">
              {selectedReason === 'too_expensive' && (
                <>Bénéficiez de 50% de réduction pendant 3 mois sur votre plan {currentPlan?.name} !</>
              )}
              {selectedReason === 'not_using' && (
                <>Passez gratuitement au plan Starter pendant 2 mois, puis reprenez quand vous êtes prêt.</>
              )}
              {selectedReason === 'temporary' && (
                <>Mettez votre abonnement en pause pendant 3 mois sans frais. Vos données seront conservées.</>
              )}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setStep('confirm')}>
              Non merci, annuler
            </Button>
            <Button variant="primary" onClick={handleAcceptOffer}>
              Accepter l&apos;offre
            </Button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Attention</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Votre accès sera maintenu jusqu&apos;à la fin de votre période de facturation</li>
              <li>• Vous perdrez l&apos;accès aux fonctionnalités premium</li>
              <li>• Vos données seront conservées pendant 30 jours</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Garder mon abonnement
            </Button>
            <Button variant="danger" onClick={handleConfirmCancel}>
              Confirmer l&apos;annulation
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
