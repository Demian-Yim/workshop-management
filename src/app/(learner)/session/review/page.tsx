'use client';
import { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useSessionStore } from '@/hooks/useSession';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import { useRealtimeDocument } from '@/hooks/useRealtimeDocument';
import type { CourseReview } from '@/types/review';

export default function ReviewPage() {
  const { courseId, sessionId, participantId, participantName } = useSessionStore();
  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '';

  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: myReview } = useRealtimeDocument<CourseReview>(
    basePath && participantId ? `${basePath}/reviews/${participantId}` : '',
    !!(basePath && participantId)
  );

  const { data: allReviews } = useRealtimeCollection<CourseReview>(
    basePath ? `${basePath}/reviews` : '', [], !!basePath
  );

  const handleSave = async () => {
    if (!basePath || !participantId || !content.trim()) return;
    setSaving(true);
    try {
      await setDoc(doc(db, `${basePath}/reviews`, participantId), {
        participantName: isAnonymous ? '익명' : participantName,
        content: content.trim(),
        rating,
        isAnonymous,
        createdAt: myReview?.createdAt || serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">✍️ 강의후기</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">별점</label>
            <div className="flex gap-1 star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-2xl"
                >
                  {star <= (rating || myReview?.rating || 0) ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">후기</label>
            <textarea
              value={content || myReview?.content || ''}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘 교육은 어떠셨나요?"
              rows={4}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition resize-none"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-600">익명으로 작성</span>
          </label>
          <button
            onClick={handleSave}
            disabled={saving || !(content.trim() || myReview?.content)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition"
          >
            {saving ? '저장 중...' : myReview ? '수정하기' : '등록하기'}
          </button>
        </div>
      </div>

      {allReviews.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-500 mb-3">전체 후기 ({allReviews.length}개)</h3>
          <div className="space-y-3">
            {allReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{review.participantName}</span>
                  <div className="text-sm">{'⭐'.repeat(review.rating)}</div>
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{review.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
