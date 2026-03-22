'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/button';

export default function FacilitatorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Facilitator error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-6 text-center">
      <div className="text-4xl">⚠️</div>
      <h2 className="text-lg font-bold text-white">오류가 발생했습니다</h2>
      <p className="text-sm text-slate-400 max-w-xs">
        일시적인 문제입니다. 다시 시도해 주세요.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}
