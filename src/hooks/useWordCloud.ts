'use client';

import { useCallback, useMemo, useState } from 'react';
import { orderBy } from 'firebase/firestore';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useSessionStore } from './useSession';
import { addDocument } from '@/lib/firebase/firestore';
import type { WordEntry, WordFrequency } from '@/types/engagement';

export function useWordCloud(activityId: string | null) {
  const { courseId, sessionId } = useSessionStore();
  const [submitting, setSubmitting] = useState(false);

  const path =
    courseId && sessionId && activityId
      ? `courses/${courseId}/sessions/${sessionId}/activities/${activityId}/words`
      : '';

  const constraints = useMemo(() => [orderBy('createdAt', 'asc')], []);

  const { data: entries, loading, error } = useRealtimeCollection<WordEntry>(
    path,
    constraints,
    !!path
  );

  const frequencies = useMemo((): WordFrequency[] => {
    const map = new Map<string, number>();
    for (const entry of entries) {
      const normalized = entry.word.trim().toLowerCase();
      if (normalized) {
        map.set(normalized, (map.get(normalized) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count);
  }, [entries]);

  const submitWord = useCallback(
    async (word: string, authorId: string) => {
      const trimmed = word.trim();
      if (!path || !activityId || !trimmed || submitting) return;
      setSubmitting(true);
      try {
        await addDocument(path, { activityId, word: trimmed, authorId });
      } finally {
        setSubmitting(false);
      }
    },
    [path, activityId, submitting]
  );

  const myEntries = useCallback(
    (authorId: string) => entries.filter((e) => e.authorId === authorId),
    [entries]
  );

  return { entries, frequencies, loading, error, submitting, submitWord, myEntries };
}
