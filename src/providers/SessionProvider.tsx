'use client';
import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSessionStore } from '@/hooks/useSession';
import { getSessionFromStorage } from '@/lib/session';

interface SessionContextType {
  courseId: string | null;
  sessionId: string | null;
  participantId: string | null;
  participantName: string | null;
  sessionCode: string | null;
  role: 'learner' | 'facilitator' | 'admin' | null;
  isJoined: boolean;
}

const SessionContext = createContext<SessionContextType>({
  courseId: null,
  sessionId: null,
  participantId: null,
  participantName: null,
  sessionCode: null,
  role: null,
  isJoined: false,
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const store = useSessionStore();

  useEffect(() => {
    if (!store.sessionCode) {
      const saved = getSessionFromStorage();
      if (saved) {
        store.setSession({ ...saved, role: 'learner' });
      }
    }
  }, []);

  const value: SessionContextType = {
    courseId: store.courseId,
    sessionId: store.sessionId,
    participantId: store.participantId,
    participantName: store.participantName,
    sessionCode: store.sessionCode,
    role: store.role,
    isJoined: !!(store.sessionCode && store.participantId),
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  return useContext(SessionContext);
}
