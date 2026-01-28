import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function daysUntil(date: string | Date): number {
  const target = new Date(date);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isTrialExpiringSoon(trialEndsAt: string, daysThreshold: number = 3): boolean {
  const days = daysUntil(trialEndsAt);
  return days > 0 && days <= daysThreshold;
}

export function isTrialExpired(trialEndsAt: string): boolean {
  return daysUntil(trialEndsAt) <= 0;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = generateId();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}
