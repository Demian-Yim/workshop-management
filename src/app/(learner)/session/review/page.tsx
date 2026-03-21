'use client';
import { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useSessionStore } from '@/hooks/useSession';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import { useRealtimeDocument } from '@/hooks/useRealtimeDocument';
import StarRating from '@/components/survey/StarRating';
import Button from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/skeleton';
import type { CourseReview } from '@/types/review';

export default function ReviewPage() {
  const { courseId, sessionId, participantId, participantName } = useSessionStore();
  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '';

  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: myReview, loading: myReviewLoading } = useRealtimeDocument<CourseReview>(
    basePath && participantId ? `${basePath}/reviews/${participantId}` : '',
    !!(basePath && participantId)
  );

  const { data: allReviews, loading: allReviewsLoading } = useRealtimeCollection<CourseReview>(
    basePath ? `${basePath}/reviews` : '', [], !!basePath
  );

  // Initialize form fields from existing review data
  useEffect(() => {
    if (myReview) {
      setContent((prev) => prev || myReview.content || '');
      setRating(myReview.rating || 5);
      setIsAnonymous(myReview.isAnonymous || false);
    }
  }, [myReview]);

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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  if (myReviewLoading) {
    return <SkeletonList count={2} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">강의후기</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">별점</label>
            <StarRating
              value={rating}
              onChange={setRating}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">후기</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘 교육은 어떠셨나요?"
              rows={4}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-600">익명으로 작성</span>
          </label>
          {saved && (
            <div className="text-center text-sm text-green-600 font-medium animate-fade-in">
              저장되었습니다
            </div>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            loading={saving}
            size="lg"
            className="w-full"
          >
            {myReview ? '수정하기' : '등록하기'}
          </Button>
        </div>
      </div>

      {allReviewsLoading ? (
        <SkeletonList count={3} />
      ) : allReviews.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-slate-500 mb-3">전체 후기 ({allReviews.length}개)</h3>
          <div className="space-y-3">
            {allReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{review.participantName}</span>
                  <StarRating value={review.rating} readOnly size="sm" />
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{review.content}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
