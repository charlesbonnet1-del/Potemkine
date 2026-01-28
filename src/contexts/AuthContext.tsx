'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { User, PlanType, Subscription, UserPreferences } from '@/types';
import { getItem, setItem, removeItem, STORAGE_KEYS } from '@/lib/storage';
import { generateId, daysUntil, isTrialExpiringSoon, isTrialExpired } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, planId: PlanType) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  updateSubscription: (updates: Partial<Subscription>) => void;
  upgradePlan: (newPlanId: PlanType) => void;
  cancelSubscription: () => void;
  reactivateSubscription: () => void;
  simulatePaymentFailure: () => void;
  recoverPayment: () => void;
  getTrialDaysRemaining: () => number | null;
  isTrialExpiringSoon: () => boolean;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getItem<User>(STORAGE_KEYS.USER);
    if (stored) {
      // Check trial status
      if (stored.subscription.status === 'trialing' && stored.subscription.trialEndsAt) {
        if (isTrialExpired(stored.subscription.trialEndsAt)) {
          stored.subscription.status = 'canceled';
        }
      }
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Simulated login - in production, this would call an API
    const stored = getItem<User>(STORAGE_KEYS.USER);
    if (stored && stored.email === email) {
      setUser(stored);
      return true;
    }

    // Demo: create user if doesn't exist
    const newUser: User = {
      id: generateId(),
      email,
      name: email.split('@')[0],
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
      subscription: {
        planId: 'pro',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
      },
      preferences: {
        emailNotifications: true,
        weeklyDigest: true,
        projectUpdates: true,
        teamMentions: true,
      },
    };

    setUser(newUser);
    setItem(STORAGE_KEYS.USER, newUser);
    return true;
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signup = useCallback(async (email: string, _password: string, name: string, planId: PlanType): Promise<boolean> => {
    const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const newUser: User = {
      id: generateId(),
      email,
      name,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
      subscription: {
        planId,
        status: 'trialing',
        trialEndsAt: trialEnd,
        currentPeriodEnd: trialEnd,
        cancelAtPeriodEnd: false,
      },
      preferences: {
        emailNotifications: true,
        weeklyDigest: true,
        projectUpdates: true,
        teamMentions: true,
      },
    };

    setUser(newUser);
    setItem(STORAGE_KEYS.USER, newUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeItem(STORAGE_KEYS.USER);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      setItem(STORAGE_KEYS.USER, updated);
      return updated;
    });
  }, []);

  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        preferences: { ...prev.preferences, ...prefs },
      };
      setItem(STORAGE_KEYS.USER, updated);
      return updated;
    });
  }, []);

  const updateSubscription = useCallback((updates: Partial<Subscription>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        subscription: { ...prev.subscription, ...updates },
      };
      setItem(STORAGE_KEYS.USER, updated);
      return updated;
    });
  }, []);

  const upgradePlan = useCallback((newPlanId: PlanType) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        subscription: {
          ...prev.subscription,
          planId: newPlanId,
          status: 'active' as const,
          trialEndsAt: undefined,
          cancelAtPeriodEnd: false,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      };
      setItem(STORAGE_KEYS.USER, updated);
      return updated;
    });
  }, []);

  const cancelSubscription = useCallback(() => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        subscription: {
          ...prev.subscription,
          status: 'canceling' as const,
          cancelAtPeriodEnd: true,
        },
      };
      setItem(STORAGE_KEYS.USER, updated);
      return updated;
    });
  }, []);

  const reactivateSubscription = useCallback(() => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        subscription: {
          ...prev.subscription,
          status: 'active' as const,
          cancelAtPeriodEnd: false,
        },
      };
      setItem(STORAGE_KEYS.USER, updated);
      return updated;
    });
  }, []);

  const simulatePaymentFailure = useCallback(() => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        subscription: {
          ...prev.subscription,
          status: 'past_due' as const,
          paymentFailedAt: new Date().toISOString(),
          paymentRetryCount: 1,
        },
      };
      setItem(STORAGE_KEYS.USER, updated);
      return updated;
    });
  }, []);

  const recoverPayment = useCallback(() => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        subscription: {
          ...prev.subscription,
          status: 'active' as const,
          paymentFailedAt: undefined,
          paymentRetryCount: undefined,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      };
      setItem(STORAGE_KEYS.USER, updated);
      return updated;
    });
  }, []);

  const getTrialDaysRemaining = useCallback((): number | null => {
    if (!user?.subscription.trialEndsAt) return null;
    return daysUntil(user.subscription.trialEndsAt);
  }, [user]);

  const checkIsTrialExpiringSoon = useCallback((): boolean => {
    if (!user?.subscription.trialEndsAt) return false;
    return isTrialExpiringSoon(user.subscription.trialEndsAt);
  }, [user]);

  const completeOnboarding = useCallback(() => {
    updateUser({ onboardingCompleted: true });
  }, [updateUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        updatePreferences,
        updateSubscription,
        upgradePlan,
        cancelSubscription,
        reactivateSubscription,
        simulatePaymentFailure,
        recoverPayment,
        getTrialDaysRemaining,
        isTrialExpiringSoon: checkIsTrialExpiringSoon,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
