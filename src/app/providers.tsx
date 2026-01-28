'use client';

import { AnalyticsProvider } from '@/contexts/AnalyticsContext';
import { AuthProvider } from '@/contexts/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AnalyticsProvider>
  );
}
