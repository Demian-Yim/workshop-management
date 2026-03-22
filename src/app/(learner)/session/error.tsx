'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/button';

export default function LearnerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Learner error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-6 text-center animate-fade-in">
      <div className="text-4xl">😵</div>
      <h2 className="text-lg font-bold text-slate-800">문제가 발생했습니다</h2>
      <p className="text-sm text-slate-500 max-w-xs">
        일시적인 오류입니다. 다시 시도해 주세요.
      </p>
      <Button onClick={reset} size="md">
        다시 시도
      </Button>
    </div>
  );
}
