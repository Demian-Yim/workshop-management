'use client';

import { useCallback, useMemo, useState } from 'react';
import { orderBy } from 'firebase/firestore';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useSessionStore } from './useSession';
import { addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import type { Activity, ActivityType, PollOption } from '@/types/engagement';
import { generateId } from '@/lib/utils';

export function useActivities() {
  const { courseId, sessionId } = useSessionStore();
  const [saving, setSaving] = useState(false);

  const path =
    courseId && sessionId
      ? `courses/${courseId}/sessions/${sessionId}/activities`
      : '';

  const constraints = useMemo(() => [orderBy('orderIndex', 'asc')], []);

  const { data: activities, loading, error } = useRealtimeCollection<Activity>(
    path,
    constraints,
    !!path
  );

  const activeActivity = useMemo(
    () => activities.find((a) => a.isActive) ?? null,
    [activities]
  );

  const createActivity = useCallback(
    async (type: ActivityType, title: string, prompt: string, options?: string[]) => {
      if (!path || saving) return;
      setSaving(true);
      try {
        const pollOptions: PollOption[] | undefined =
          type === 'poll' && options && options.length > 0
            ? options.filter((o) => o.trim()).map((text) => ({ id: generateId(), text: text.trim(), voteCount: 0 }))
            : undefined;

        await addDocument(path, {
          type,
          title,
          prompt: prompt || null,
          isActive: false,
          orderIndex: activities.length,
          ...(pollOptions ? { options: pollOptions } : {}),
        });
      } finally {
        setSaving(false);
      }
    },
    [path, saving, activities.length]
  );

  const activateActivity = useCallback(
    async (activityId: string) => {
      if (!path) return;
      // deactivate all, then activate target
      await Promise.all(
        activities.map((a) =>
          updateDocument(`${path}/${a.id}`, { isActive: a.id === activityId })
        )
      );
    },
    [path, activities]
  );

  const deactivateAll = useCallback(async () => {
    if (!path) return;
    await Promise.all(
      activities.filter((a) => a.isActive).map((a) =>
        updateDocument(`${path}/${a.id}`, { isActive: false })
      )
    );
  }, [path, activities]);

  const removeActivity = useCallback(
    async (activityId: string) => {
      if (!path) return;
      await deleteDocument(`${path}/${activityId}`);
    },
    [path]
  );

  return {
    activities,
    activeActivity,
    loading,
    error,
    saving,
    createActivity,
    activateActivity,
    deactivateAll,
    removeActivity,
  };
}
