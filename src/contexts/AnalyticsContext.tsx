'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { AnalyticsEvent, AnalyticsEventType } from '@/types';
import { getItem, setItem, STORAGE_KEYS } from '@/lib/storage';
import { generateId, getSessionId } from '@/lib/utils';

interface AnalyticsContextType {
  track: (eventType: AnalyticsEventType, properties?: Record<string, unknown>) => void;
  getEvents: () => AnalyticsEvent[];
  getEventsByType: (eventType: AnalyticsEventType) => AnalyticsEvent[];
  getEventsByUser: (userId: string) => AnalyticsEvent[];
  clearEvents: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const stored = getItem<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS) || [];
    setEvents(stored);

    const user = getItem<{ id: string }>(STORAGE_KEYS.USER);
    if (user) setUserId(user.id);
  }, []);

  const track = useCallback((eventType: AnalyticsEventType, properties?: Record<string, unknown>) => {
    const event: AnalyticsEvent = {
      id: generateId(),
      userId: userId,
      eventType,
      properties,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
    };

    setEvents(prev => {
      const updated = [...prev, event];
      setItem(STORAGE_KEYS.ANALYTICS, updated);
      return updated;
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventType, properties);
    }
  }, [userId]);

  const getEvents = useCallback(() => events, [events]);

  const getEventsByType = useCallback((eventType: AnalyticsEventType) => {
    return events.filter(e => e.eventType === eventType);
  }, [events]);

  const getEventsByUser = useCallback((uid: string) => {
    return events.filter(e => e.userId === uid);
  }, [events]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setItem(STORAGE_KEYS.ANALYTICS, []);
  }, []);

  return (
    <AnalyticsContext.Provider value={{ track, getEvents, getEventsByType, getEventsByUser, clearEvents }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
