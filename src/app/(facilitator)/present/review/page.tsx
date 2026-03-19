'use client';
import { PenLine } from 'lucide-react';
import { useSessionStore } from '@/hooks/useSession';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import StarRating from '@/components/survey/StarRating';
import { SkeletonList } from '@/components/ui/skeleton';
import EmptyState from '@/components/ui/empty-state';
import type { CourseReview } from '@/types/review';
import Masonry from 'react-masonry-css';

export default function FacilitatorReviewPage() {
  const { courseId, sessionId } = useSessionStore();
  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}/reviews` : '';
  const { data: reviews, loading } = useRealtimeCollection<CourseReview>(basePath, [], !!basePath);

  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">강의후기</h1>
          <p className="text-slate-400 mt-1">{reviews.length}개의 후기</p>
        </div>
        {reviews.length > 0 && (
          <div className="text-right">
            <StarRating value={Math.round(avgRating)} readOnly size="sm" />
            <p className="text-sm text-slate-400">평균 {avgRating}점</p>
          </div>
        )}
      </div>

      {loading ? (
        <SkeletonList count={3} dark />
      ) : reviews.length === 0 ? (
        <EmptyState icon={PenLine} title="아직 후기가 없습니다" dark />
      ) : (
        <Masonry
          breakpointCols={{ default: 3, 1280: 2, 768: 1 }}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {reviews.map((review) => (
            <div key={review.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700 mb-4 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-slate-300">{review.participantName}</span>
                <StarRating value={review.rating} readOnly size="sm" />
              </div>
              <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{review.content}</p>
            </div>
          ))}
        </Masonry>
      )}
    </div>
  );
}
