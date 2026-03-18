'use client';
import Masonry from 'react-masonry-css';
import ReviewCard from './ReviewCard';
import type { CourseReview } from '@/types/review';

interface ReviewWallProps {
  reviews: CourseReview[];
  dark?: boolean;
}

const breakpoints = { default: 3, 1100: 2, 700: 1 };

export default function ReviewWall({ reviews, dark }: ReviewWallProps) {
  if (reviews.length === 0) {
    return (
      <div className={`text-center py-12 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        아직 후기가 없습니다
      </div>
    );
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-amber-400">{avgRating.toFixed(1)}</div>
        <div className="flex justify-center gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={`text-lg ${star <= Math.round(avgRating) ? 'text-amber-400' : 'text-slate-500'}`}>
              ★
            </span>
          ))}
        </div>
        <p className={`text-sm mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          {reviews.length}개 후기
        </p>
      </div>
      <Masonry breakpointCols={breakpoints} className="masonry-grid" columnClassName="masonry-grid-column">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} dark={dark} />
        ))}
      </Masonry>
    </div>
  );
}
