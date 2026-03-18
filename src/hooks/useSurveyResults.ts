'use client';

import { useRealtimeCollection } from './useRealtimeCollection';
import { useSessionStore } from './useSession';
import type { SurveyResponse } from '@/types/survey';

export function useSurveyResults() {
  const { courseId, sessionId } = useSessionStore();

  const path =
    courseId && sessionId
      ? `courses/${courseId}/sessions/${sessionId}/surveyResponses`
      : '';

  const { data, loading, error } = useRealtimeCollection<SurveyResponse>(
    path,
    [],
    !!path
  );

  const averageOverall =
    data.length > 0
      ? data.reduce((sum, r) => sum + r.overallRating, 0) / data.length
      : 0;

  return {
    responses: data,
    responseCount: data.length,
    averageOverall: Math.round(averageOverall * 10) / 10,
    loading,
    error,
  };
}
