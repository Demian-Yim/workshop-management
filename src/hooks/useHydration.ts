'use client';
import { useState, useEffect } from 'react';

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical SSR hydration detection pattern
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
