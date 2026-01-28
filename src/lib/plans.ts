import { Plan } from '@/types';

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    features: [
      'Up to 5 projects',
      '3 team members',
      'Basic reports',
      'Email support',
      '5GB storage',
    ],
    projectLimit: 5,
    teamMemberLimit: 3,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    features: [
      'Up to 20 projects',
      '10 team members',
      'Advanced reports',
      'Priority support',
      '25GB storage',
      'Custom fields',
      'API access',
    ],
    projectLimit: 20,
    teamMemberLimit: 10,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    features: [
      'Unlimited projects',
      'Unlimited team members',
      'Custom reports',
      'Dedicated support',
      'Unlimited storage',
      'Custom fields',
      'API access',
      'SSO integration',
      'Advanced security',
      'SLA guarantee',
    ],
    projectLimit: Infinity,
    teamMemberLimit: Infinity,
  },
];

export function getPlan(planId: string): Plan | undefined {
  return PLANS.find(p => p.id === planId);
}

export async function createCheckoutSession(planId: string, email?: string, userId?: string) {
  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, email, userId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création de la session');
  }

  return response.json() as Promise<{ sessionId: string; url: string }>;
}

export async function createPortalSession(email: string) {
  const response = await fetch('/api/stripe/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création du portail');
  }

  return response.json() as Promise<{ url: string }>;
}
