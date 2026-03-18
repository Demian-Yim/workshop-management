'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, DocumentData, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface UseRealtimeDocumentResult<T> {
  data: T | null;
  loading: boolean;
  error: FirestoreError | null;
}

export function useRealtimeDocument<T extends DocumentData>(
  documentPath: string,
  enabled: boolean = true
): UseRealtimeDocumentResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!enabled || !documentPath) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, documentPath);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as unknown as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [documentPath, enabled]);

  return { data, loading, error };
}
