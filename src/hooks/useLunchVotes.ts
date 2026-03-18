'use client';

import { useRealtimeCollection } from './useRealtimeCollection';
import { useRealtimeDocument } from './useRealtimeDocument';
import { useSessionStore } from './useSession';
import type { LunchVote, LunchPoll } from '@/types/lunch';

export function useLunchVotes() {
  const { courseId, sessionId } = useSessionStore();

  const basePath =
    courseId && sessionId
      ? `courses/${courseId}/sessions/${sessionId}`
      : '';

  const { data: votes, loading: votesLoading } =
    useRealtimeCollection<LunchVote>(
      basePath ? `${basePath}/lunchVotes` : '',
      [],
      !!basePath
    );

  const { data: poll, loading: pollLoading } =
    useRealtimeDocument<LunchPoll>(
      basePath ? `${basePath}/lunchPoll/current` : '',
      !!basePath
    );

  const voteCounts: Record<string, number> = {};
  votes.forEach((v) => {
    voteCounts[v.optionId] = (voteCounts[v.optionId] || 0) + 1;
  });

  return {
    poll,
    votes,
    voteCounts,
    totalVotes: votes.length,
    loading: votesLoading || pollLoading,
  };
}
