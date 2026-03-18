'use client';

import { useMemo } from 'react';
import { orderBy } from 'firebase/firestore';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useSessionStore } from './useSession';
import type { AttendanceRecord } from '@/types/attendance';

export function useAttendance() {
  const { courseId, sessionId } = useSessionStore();

  const path =
    courseId && sessionId
      ? `courses/${courseId}/sessions/${sessionId}/attendance`
      : '';

  const constraints = useMemo(() => [orderBy('checkedInAt', 'asc')], []);

  const { data, loading, error } = useRealtimeCollection<AttendanceRecord>(
    path,
    constraints,
    !!path
  );

  return {
    attendees: data,
    attendeeCount: data.length,
    loading,
    error,
  };
}
