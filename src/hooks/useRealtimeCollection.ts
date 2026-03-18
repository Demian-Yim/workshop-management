'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  onSnapshot,
  QueryConstraint,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface UseRealtimeCollectionResult<T> {
  data: T[];
  loading: boolean;
  error: FirestoreError | null;
}

export function useRealtimeCollection<T extends DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[] = [],
  enabled: boolean = true
): UseRealtimeCollectionResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!enabled || !collectionPath) {
      setLoading(false);
      return;
    }

    const colRef = collection(db, collectionPath);
    const q = constraints.length > 0 ? query(colRef, ...constraints) : colRef;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as unknown as T[];
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionPath, enabled]);

  return { data, loading, error };
}
