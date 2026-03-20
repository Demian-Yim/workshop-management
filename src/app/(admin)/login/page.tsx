'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, resetPassword } from '@/lib/firebase/auth';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) { setError('이메일과 비밀번호를 입력하세요'); return; }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch {
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인하세요.');
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) { setError('이메일을 먼저 입력하세요'); return; }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await resetPassword(email);
      setMessage('비밀번호 재설정 이메일을 발송했습니다. 메일함을 확인하세요.');
    } catch {
      setError('비밀번호 재설정에 실패했습니다. 등록된 이메일인지 확인하세요.');
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {message && <p className="text-green-600 text-sm text-center">{message}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition text-lg"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
          <button
            onClick={handleResetPassword}
            disabled={loading}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-slate-400 transition"
          >
            비밀번호를 잊으셨나요?
          </button>
        </div>
      </div>
    </div>
  );
}
