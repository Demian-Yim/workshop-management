'use client';
import { useState, useMemo } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { orderBy } from 'firebase/firestore';
import { useSessionStore } from '@/hooks/useSession';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import type { Announcement } from '@/types/announcement';
import { toast } from '@/components/ui/toast';

export default function FacilitatorAnnouncementsPage() {
  const { courseId, sessionId, participantId, participantName } = useSessionStore();
  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}/announcements` : '';
  const constraints = useMemo(() => [orderBy('createdAt', 'desc')], []);
  const { data: announcements } = useRealtimeCollection<Announcement>(basePath, constraints, !!basePath);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!basePath || !title.trim() || !content.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, basePath), {
        authorId: participantId,
        authorName: participantName,
        title: title.trim(),
        content: content.trim(),
        priority,
        isActive: true,
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setContent('');
      setPriority('normal');
    } catch (err) {
      console.error(err);
      toast.error('공지 전송에 실패했습니다');
    }
    setSending(false);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-8">공지사항</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">새 공지 작성</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공지 제목"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공지 내용을 입력하세요..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 outline-none focus:border-blue-500 transition resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setPriority('normal')}
                className={`px-4 py-2 rounded-lg text-sm transition ${priority === 'normal' ? 'bg-slate-600 text-white' : 'bg-slate-700 text-slate-400'}`}
              >일반</button>
              <button
                onClick={() => setPriority('urgent')}
                className={`px-4 py-2 rounded-lg text-sm transition ${priority === 'urgent' ? 'bg-red-500/30 text-red-300' : 'bg-slate-700 text-slate-400'}`}
              >긴급</button>
            </div>
            <button
              onClick={handleSend}
              disabled={sending || !title.trim() || !content.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition"
            >
              {sending ? '전송 중...' : '공지 보내기'}
            </button>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">공지 기록 ({announcements.length})</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`rounded-lg p-4 border ${
                  ann.priority === 'urgent' ? 'border-red-500/30 bg-red-500/10' : 'border-slate-700 bg-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {ann.priority === 'urgent' && <span className="text-xs text-red-400">긴급</span>}
                  <h3 className="font-semibold text-sm text-slate-200">{ann.title}</h3>
                </div>
                <p className="text-sm text-slate-400">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
