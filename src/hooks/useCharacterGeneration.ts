'use client';

import { useState, useCallback } from 'react';
import type { CharacterGenerationResponse } from '@/types/character';

interface UseCharacterGenerationReturn {
  generating: boolean;
  characterImageBase64: string | null;
  error: string | null;
  generate: (imageBase64: string, style: 'cartoon' | 'anime' | 'pixel') => Promise<string | null>;
  reset: () => void;
}

export function useCharacterGeneration(): UseCharacterGenerationReturn {
  const [generating, setGenerating] = useState(false);
  const [characterImageBase64, setCharacterImageBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (imageBase64: string, style: 'cartoon' | 'anime' | 'pixel'): Promise<string | null> => {
      setGenerating(true);
      setError(null);
      setCharacterImageBase64(null);

      // Strip data URL prefix if present
      const base64Data = imageBase64.includes(',')
        ? imageBase64.split(',')[1]
        : imageBase64;

      try {
        const response = await fetch('/api/character/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64Data, style }),
        });

        const data: CharacterGenerationResponse & { characterImageBase64?: string } =
          await response.json();

        if (!response.ok || !data.success) {
          setError(data.error || '캐릭터 생성에 실패했습니다');
          return null;
        }

        const resultBase64 = data.characterImageBase64 || data.characterImageUrl;
        setCharacterImageBase64(resultBase64);
        return resultBase64;
      } catch {
        setError('네트워크 오류가 발생했습니다');
        return null;
      } finally {
        setGenerating(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setGenerating(false);
    setCharacterImageBase64(null);
    setError(null);
  }, []);

  return {
    generating,
    characterImageBase64,
    error,
    generate,
    reset,
  };
}
