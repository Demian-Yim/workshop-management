'use client';

import { useCallback, useMemo, useState } from 'react';
import { orderBy } from 'firebase/firestore';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useSessionStore } from './useSession';
import {
  addDocument,
  updateDocument,
  increment,
  arrayUnion,
  arrayRemove,
} from '@/lib/firebase/firestore';
import type { QAQuestion } from '@/types/engagement';

export function useQA(activityId: string | null) {
  const { courseId, sessionId } = useSessionStore();
  const [submitting, setSubmitting] = useState(false);

  const path =
    courseId && sessionId && activityId
      ? `courses/${courseId}/sessions/${sessionId}/activities/${activityId}/questions`
      : '';

  const constraints = useMemo(() => [orderBy('upvoteCount', 'desc'), orderBy('createdAt', 'asc')], []);

  const { data: questions, loading, error } = useRealtimeCollection<QAQuestion>(
    path,
    constraints,
    !!path,
    100
  );

  const submitQuestion = useCallback(
    async (content: string, authorId: string, authorName: string) => {
      if (!path || !activityId || submitting) return;
      setSubmitting(true);
      try {
        await addDocument(path, {
          activityId,
          authorId,
          authorName,
          content,
          upvoteCount: 0,
          upvotedBy: [],
          answered: false,
        });
      } finally {
        setSubmitting(false);
      }
    },
    [path, activityId, submitting]
  );

  const toggleUpvote = useCallback(
    async (questionId: string, userId: string) => {
      if (!path) return;
      const question = questions.find((q) => q.id === questionId);
      if (!question) return;

      const docPath = `${path}/${questionId}`;
      const hasVoted = question.upvotedBy.includes(userId);

      try {
        if (hasVoted) {
          await updateDocument(docPath, {
            upvoteCount: increment(-1),
            upvotedBy: arrayRemove(userId),
          });
        } else {
          await updateDocument(docPath, {
            upvoteCount: increment(1),
            upvotedBy: arrayUnion(userId),
          });
        }
      } catch (err) {
        throw new Error(`추천 업데이트 실패: ${err instanceof Error ? err.message : String(err)}`);
      }
    },
    [path, questions]
  );

  const markAnswered = useCallback(
    async (questionId: string) => {
      if (!path) return;
      try {
        await updateDocument(`${path}/${questionId}`, { answered: true });
      } catch (err) {
        throw new Error(`답변 완료 처리 실패: ${err instanceof Error ? err.message : String(err)}`);
      }
    },
    [path]
  );

  const unanswered = useMemo(
    () => questions.filter((q) => !q.answered),
    [questions]
  );
  const answered = useMemo(
    () => questions.filter((q) => q.answered),
    [questions]
  );

  return {
    questions,
    unanswered,
    answered,
    loading,
    error,
    submitting,
    submitQuestion,
    toggleUpvote,
    markAnswered,
  };
}
