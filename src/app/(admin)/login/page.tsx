'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/firebase/auth';

export default function AdminLoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch {
      setError('Google 로그인에 실패했습니다. 다시 시도해주세요.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-violet-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⚙️</div>
          <h1 className="text-2xl font-bold text-slate-900">관리자 로그인</h1>
          <p className="text-slate-500 mt-1">교육 관리 시스템에 로그인하세요</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-slate-50 disabled:bg-slate-100 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl transition text-lg flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? '로그인 중...' : 'Google로 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}
