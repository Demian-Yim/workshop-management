'use client';

import { useMemo } from 'react';
import { orderBy } from 'firebase/firestore';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useSessionStore } from './useSession';
import type { Team } from '@/types/team';

export function useTeams() {
  const { courseId, sessionId } = useSessionStore();

  const path =
    courseId && sessionId
      ? `courses/${courseId}/sessions/${sessionId}/teams`
      : '';

  const constraints = useMemo(() => [orderBy('createdAt', 'asc')], []);

  const { data, loading, error } = useRealtimeCollection<Team>(
    path,
    constraints,
    !!path
  );

  const teams = useMemo(
    () => data.map((t) => ({ id: t.id, name: t.teamName, color: t.color })),
    [data]
  );

  return { teams, loading, error };
}
