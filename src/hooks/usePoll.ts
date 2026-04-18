'use client';

import { useCallback, useMemo, useState } from 'react';
import { orderBy } from 'firebase/firestore';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useSessionStore } from './useSession';
import { addDocument, updateDocument } from '@/lib/firebase/firestore';
import type { PollVote } from '@/types/engagement';

export function usePollVotes(activityId: string | null) {
  const { courseId, sessionId } = useSessionStore();
  const [voting, setVoting] = useState(false);

  const path =
    courseId && sessionId && activityId
      ? `courses/${courseId}/sessions/${sessionId}/activities/${activityId}/votes`
      : '';

  const constraints = useMemo(() => [orderBy('createdAt', 'asc')], []);

  const { data: votes, loading, error } = useRealtimeCollection<PollVote>(
    path,
    constraints,
    !!path
  );

  const voteCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const vote of votes) {
      map[vote.optionId] = (map[vote.optionId] ?? 0) + 1;
    }
    return map;
  }, [votes]);

  const myVote = useCallback(
    (participantId: string) => votes.find((v) => v.participantId === participantId) ?? null,
    [votes]
  );

  const castVote = useCallback(
    async (optionId: string, participantId: string) => {
      if (!path || !activityId || !courseId || !sessionId || voting) return;

      const existing = votes.find((v) => v.participantId === participantId);
      if (existing) return;

      setVoting(true);
      try {
        await addDocument(path, { activityId, participantId, optionId });
      } finally {
        setVoting(false);
      }
    },
    [path, activityId, courseId, sessionId, voting, votes]
  );

  const changeVote = useCallback(
    async (newOptionId: string, participantId: string) => {
      if (!path || !activityId || !courseId || !sessionId || voting) return;

      const existing = votes.find((v) => v.participantId === participantId);
      if (!existing) {
        await castVote(newOptionId, participantId);
        return;
      }

      if (existing.optionId === newOptionId) return;

      setVoting(true);
      try {
        const voteDocPath = `${path}/${existing.id}`;
        await updateDocument(voteDocPath, { optionId: newOptionId });
      } finally {
        setVoting(false);
      }
    },
    [path, activityId, courseId, sessionId, voting, votes, castVote]
  );

  return { votes, voteCounts, loading, error, voting, myVote, castVote, changeVote };
}

export function usePollOptionVoteCount(
  activityId: string | null,
  optionId: string
): number {
  const { courseId, sessionId } = useSessionStore();

  const path =
    courseId && sessionId && activityId
      ? `courses/${courseId}/sessions/${sessionId}/activities/${activityId}/votes`
      : '';

  const constraints = useMemo(() => [orderBy('createdAt', 'asc')], []);
  const { data: votes } = useRealtimeCollection<PollVote>(path, constraints, !!path);

  return useMemo(
    () => votes.filter((v) => v.optionId === optionId).length,
    [votes, optionId]
  );
}
