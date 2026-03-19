'use client';

import { useState, useCallback, useRef } from 'react';
import type { KakaoPlaceResult } from '@/types/restaurant';

interface UseKakaoSearchResult {
  results: KakaoPlaceResult[];
  loading: boolean;
  error: string | null;
  search: (query: string, x?: string, y?: string) => void;
  clear: () => void;
}

export function useKakaoSearch(debounceMs: number = 300): UseKakaoSearchResult {
  const [results, setResults] = useState<KakaoPlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(
    (query: string, x?: string, y?: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      timerRef.current = setTimeout(async () => {
        if (abortRef.current) {
          abortRef.current.abort();
        }
        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const params = new URLSearchParams({ query: query.trim() });
          if (x && y) {
            params.set('x', x);
            params.set('y', y);
          }

          const response = await fetch(`/api/kakao/search?${params.toString()}`, {
            signal: controller.signal,
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || '검색 중 오류가 발생했습니다');
          }

          const data = await response.json();
          setResults(data.places || []);
          setError(null);
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            return;
          }
          setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다');
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, debounceMs);
    },
    [debounceMs]
  );

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setResults([]);
    setError(null);
    setLoading(false);
  }, []);

  return { results, loading, error, search, clear };
}
