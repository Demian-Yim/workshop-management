'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useState, useEffect } from 'react';
import type { Session } from '@/types/session';

interface SessionState {
  courseId: string;
  sessionId: string;
  participantId: string;
  participantName: string;
  sessionCode: string;
  role: 'learner' | 'facilitator' | 'admin' | null;
  sessionData: Session | null;
  _hasHydrated: boolean;
  setSession: (data: {
    courseId: string;
    sessionId: string;
    participantId: string;
    participantName: string;
    sessionCode: string;
    role: 'learner' | 'facilitator' | 'admin';
  }) => void;
  setSessionData: (data: Session | null) => void;
  clearSession: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      courseId: '',
      sessionId: '',
      participantId: '',
      participantName: '',
      sessionCode: '',
      role: null,
      sessionData: null,
      _hasHydrated: false,
      setSession: (data) => set({ ...data }),
      setSessionData: (sessionData) => set({ sessionData }),
      clearSession: () =>
        set({
          courseId: '',
          sessionId: '',
          participantId: '',
          participantName: '',
          sessionCode: '',
          role: null,
          sessionData: null,
        }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'workshop-session',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

/** SSR-safe hook: returns true after Zustand hydration from localStorage */
export function useSessionHydrated(): boolean {
  const storeHydrated = useSessionStore((s) => s._hasHydrated);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical SSR hydration detection pattern
  useEffect(() => setMounted(true), []);
  return mounted && storeHydrated;
}
