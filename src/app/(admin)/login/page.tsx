'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signInWithGoogle, handleGoogleRedirectResult, resetPassword } from '@/lib/firebase/auth';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    handleGoogleRedirectResult()
      .then((credential) => {
        if (credential) router.push('/dashboard');
      })
      .catch(() => {
        setError('Google 로그인에 실패했습니다. 다시 시도해주세요.');
        setLoading(false);
      });
  }, [router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력하세요');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn(email.trim(), password);
      router.push('/dashboard');
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다');
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('비밀번호 재설정을 위해 이메일을 먼저 입력하세요');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch {
      setError('비밀번호 재설정 이메일 전송에 실패했습니다');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12">
        <div>
          <p className="text-white text-xs tracking-[0.3em] uppercase font-medium">FLOW~</p>
        </div>
        <div>
          <h2 className="text-white text-5xl font-black leading-none tracking-tight mb-6">
            AX<br />Design<br />Lab
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
            워크샵 관리 플랫폼 — 퍼실리테이터와 참가자를 연결하는 통합 운영 시스템
          </p>
        </div>
        <div className="text-neutral-600 text-xs">
          © 2026 FLOW~ AX Design Lab
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-sm mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <p className="text-xs tracking-[0.3em] uppercase font-medium text-neutral-400">FLOW~</p>
            <h1 className="text-2xl font-black tracking-tight mt-1">AX Design Lab</h1>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">관리자 로그인</h1>
            <p className="text-sm text-neutral-400 mt-1">계정 정보를 입력하세요</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
              {error}
            </div>
          )}
          {resetSent && (
            <div className="mb-4 px-4 py-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm">
              비밀번호 재설정 이메일을 전송했습니다. 받은편지함을 확인하세요.
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                className="w-full px-0 py-3 border-0 border-b-2 border-neutral-200 focus:border-black focus:outline-none text-sm bg-transparent transition-colors placeholder:text-neutral-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-0 py-3 border-0 border-b-2 border-neutral-200 focus:border-black focus:outline-none text-sm bg-transparent transition-colors placeholder:text-neutral-300"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black hover:bg-neutral-800 disabled:opacity-40 text-white font-bold text-sm tracking-widest uppercase transition-colors"
              >
                {loading ? '로그인 중…' : '로그인'}
              </button>
            </div>
          </form>

          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading}
              className="text-xs text-neutral-400 hover:text-neutral-700 underline transition-colors disabled:opacity-40"
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-neutral-100" />
              <span className="text-xs text-neutral-300 uppercase tracking-widest">또는</span>
              <div className="flex-1 h-px bg-neutral-100" />
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 bg-white hover:bg-neutral-50 disabled:opacity-40 border-2 border-neutral-900 text-neutral-900 font-bold text-sm tracking-widest uppercase transition-colors flex items-center justify-center gap-3"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google로 로그인
            </button>
          </div>

          <p className="mt-8 text-xs text-neutral-300 text-center">
            관리자 계정이 없으신가요?{' '}
            <a href="mailto:rescuemyself@gmail.com" className="text-neutral-500 hover:text-black underline transition-colors">
              문의하기
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
