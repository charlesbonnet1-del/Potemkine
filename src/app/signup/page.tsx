'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { PLANS, createCheckoutSession } from '@/lib/plans';
import { PlanType } from '@/types';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, user, isLoading } = useAuth();
  const { track } = useAnalytics();

  const planParam = searchParams.get('plan') as PlanType | null;
  const selectedPlan = PLANS.find(p => p.id === planParam) || PLANS[1]; // Default to Pro

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    track('page_view', { page: 'signup', plan: selectedPlan.id });
    track('signup_started', { plan: selectedPlan.id });
  }, [track, selectedPlan.id]);

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // 1. Create local account with trial
      const success = await signup(email, password, name, selectedPlan.id);
      if (!success) {
        setError('Une erreur est survenue lors de l\'inscription');
        return;
      }

      track('trial_started', { plan: selectedPlan.id });

      // 2. Redirect to Stripe Checkout for payment setup
      try {
        const { url } = await createCheckoutSession(selectedPlan.id, email);
        if (url) {
          window.location.href = url;
          return;
        }
      } catch {
        // Stripe not configured - continue with local-only flow
        console.warn('Stripe not configured, continuing with local trial');
      }

      // Fallback: go to dashboard if Stripe is not set up
      router.push('/dashboard');
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-xl font-bold text-white">T</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">TaskFlow</span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Créez votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Déjà inscrit ?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Connectez-vous
            </Link>
          </p>
        </div>

        {/* Selected plan */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Plan sélectionné</p>
              <p className="font-semibold text-blue-900">{selectedPlan.name} - {selectedPlan.price}€/mois</p>
            </div>
            <Link href="/#pricing" className="text-sm text-blue-600 hover:text-blue-700">
              Changer
            </Link>
          </div>
          <p className="text-sm text-blue-700 mt-2">
            14 jours d&apos;essai gratuit inclus
          </p>
        </div>

        {/* Payment info */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CreditCardIcon className="h-4 w-4 text-gray-400" />
            <span>Vous serez redirigé vers Stripe pour entrer vos informations de paiement</span>
          </div>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              id="name"
              label="Nom complet"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jean Dupont"
            />

            <Input
              id="email"
              label="Adresse email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@example.com"
            />

            <Input
              id="password"
              label="Mot de passe"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
              J&apos;accepte les{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                conditions d&apos;utilisation
              </a>{' '}
              et la{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                politique de confidentialité
              </a>
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Redirection vers le paiement...
              </span>
            ) : (
              <>
                <LockIcon className="h-4 w-4 mr-2 inline" />
                S&apos;inscrire et configurer le paiement
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Paiement sécurisé par Stripe • 14 jours d&apos;essai gratuit • Annulez à tout moment
        </p>
      </div>
    </div>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
