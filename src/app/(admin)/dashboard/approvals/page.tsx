'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface PendingUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  requestedAt: { seconds: number } | null;
  status: string;
}

export default function ApprovalsPage() {
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [approved, setApproved] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const unsubPending = onSnapshot(collection(db, 'pendingUsers'), (snap) => {
      setPending(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as PendingUser)));
      setLoading(false);
    });
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setApproved(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as PendingUser)));
    });
    return () => { unsubPending(); unsubUsers(); };
  }, []);

  const handleApprove = async (user: PendingUser) => {
    setProcessing(user.uid);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        approved: true,
        role: 'facilitator',
        approvedAt: serverTimestamp(),
      });
      await deleteDoc(doc(db, 'pendingUsers', user.uid));
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (user: PendingUser) => {
    if (!confirm(`${user.displayName || user.email} 사용자를 거절하시겠습니까?`)) return;
    setProcessing(user.uid);
    try {
      await deleteDoc(doc(db, 'pendingUsers', user.uid));
    } finally {
      setProcessing(null);
    }
  };

  const handleRevoke = async (user: PendingUser) => {
    if (!confirm(`${user.displayName || user.email} 사용자의 승인을 취소하시겠습니까?`)) return;
    setProcessing(user.uid);
    try {
      await deleteDoc(doc(db, 'users', user.uid));
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (ts: { seconds: number } | null) => {
    if (!ts) return '-';
    return new Date(ts.seconds * 1000).toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">사용자 승인 관리</h1>
        <p className="text-slate-500 text-sm mt-1">Google로 로그인한 신규 사용자를 승인하거나 거절합니다</p>
      </div>

      {/* Pending Users */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-900">승인 대기</h2>
          {pending.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
              {pending.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">로딩 중...</div>
        ) : pending.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">승인 대기 중인 사용자가 없습니다</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pending.map((user) => (
              <div key={user.uid} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-medium">
                      {(user.displayName || user.email || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{user.displayName || '(이름 없음)'}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <p className="text-xs text-slate-400 mt-0.5">요청: {formatDate(user.requestedAt)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(user)}
                    disabled={processing === user.uid}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    승인
                  </button>
                  <button
                    onClick={() => handleReject(user)}
                    disabled={processing === user.uid}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 text-xs font-medium rounded-lg border border-red-200 transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Users */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <h2 className="font-semibold text-slate-900">승인된 사용자</h2>
          {approved.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
              {approved.length}
            </span>
          )}
        </div>

        {approved.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">승인된 사용자가 없습니다</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {approved.map((user) => (
              <div key={user.uid} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-medium">
                      {(user.displayName || user.email || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{user.displayName || '(이름 없음)'}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRevoke(user)}
                  disabled={processing === user.uid}
                  className="text-xs text-slate-400 hover:text-red-500 disabled:opacity-50 transition"
                >
                  승인 취소
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
