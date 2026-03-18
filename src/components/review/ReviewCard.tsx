'use client';
import type { CourseReview } from '@/types/review';

interface ReviewCardProps {
  review: CourseReview;
  dark?: boolean;
}

export default function ReviewCard({ review, dark }: ReviewCardProps) {
  return (
    <div className={`p-4 rounded-xl ${dark ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`font-semibold text-sm ${dark ? 'text-white' : 'text-slate-900'}`}>
          {review.isAnonymous ? '익명' : review.participantName}
        </span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={`text-sm ${star <= review.rating ? 'text-amber-400' : 'text-slate-300'}`}>
              ★
            </span>
          ))}
        </div>
      </div>
      <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
        {review.content}
      </p>
    </div>
  );
}
