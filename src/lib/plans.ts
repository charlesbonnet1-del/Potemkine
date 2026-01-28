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
