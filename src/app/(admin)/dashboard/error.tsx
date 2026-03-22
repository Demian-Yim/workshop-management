'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-6 text-center animate-fade-in">
      <div className="text-4xl">🔧</div>
      <h2 className="text-lg font-bold text-slate-800">관리자 페이지 오류</h2>
      <p className="text-sm text-slate-500 max-w-xs">
        일시적인 문제입니다. 다시 시도해 주세요.
      </p>
      <Button onClick={reset} variant="admin" size="md">
        다시 시도
      </Button>
    </div>
  );
}
