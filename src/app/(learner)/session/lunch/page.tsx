'use client';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useSessionStore } from '@/hooks/useSession';
import { useLunchVotes } from '@/hooks/useLunchVotes';
import { useRealtimeDocument } from '@/hooks/useRealtimeDocument';
import type { LunchVote } from '@/types/lunch';

export default function LunchPage() {
  const { courseId, sessionId, participantId, participantName } = useSessionStore();
  const { poll, voteCounts, totalVotes, loading } = useLunchVotes();
  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '';

  const { data: myVote } = useRealtimeDocument<LunchVote>(
    basePath && participantId ? `${basePath}/lunchVotes/${participantId}` : '',
    !!(basePath && participantId)
  );

  const handleVote = async (optionId: string) => {
    if (!basePath || !participantId) return;
    try {
      await setDoc(doc(db, `${basePath}/lunchVotes`, participantId), {
        optionId,
        participantName,
        votedAt: myVote?.votedAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-400">로딩 중...</div>;

  if (!poll) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-5xl mb-4">🍱</div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">점심메뉴 투표</h2>
        <p className="text-slate-500">아직 투표가 열리지 않았습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">🍱 {poll.title || '점심메뉴 투표'}</h2>
        <span className="text-xs text-slate-500">{totalVotes}명 투표</span>
      </div>

      {!poll.isOpen && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <p className="text-sm text-amber-700">투표가 마감되었습니다</p>
        </div>
      )}

      <div className="space-y-3">
        {poll.options?.map((option) => {
          const count = voteCounts[option.id] || 0;
          const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isSelected = myVote?.optionId === option.id;

          return (
            <button
              key={option.id}
              onClick={() => poll.isOpen && handleVote(option.id)}
              disabled={!poll.isOpen}
              className={`w-full text-left bg-white rounded-xl p-4 shadow-sm border-2 transition ${
                isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'
              } ${!poll.isOpen ? 'cursor-default' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{option.name}</span>
                  {isSelected && <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">선택됨</span>}
                </div>
                <span className="text-sm font-medium text-slate-500">{count}표 ({percentage}%)</span>
              </div>
              {option.description && (
                <p className="text-xs text-slate-500 mb-2">{option.description}</p>
              )}
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {myVote && poll.isOpen && (
        <p className="text-center text-xs text-slate-400">다른 메뉴를 탭하면 투표가 변경됩니다</p>
      )}
    </div>
  );
}
