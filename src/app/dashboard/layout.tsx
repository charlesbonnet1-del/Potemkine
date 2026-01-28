'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TrialBanner } from '@/components/analytics/TrialBanner';
import { PaymentFailedBanner } from '@/components/analytics/PaymentFailedBanner';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { initializeDemoData } from '@/lib/data';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      initializeDemoData(user.id);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TrialBanner />
        <PaymentFailedBanner />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <OnboardingModal />
    </div>
  );
}
