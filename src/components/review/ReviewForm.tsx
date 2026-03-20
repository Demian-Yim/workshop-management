'use client';
import { useState } from 'react';
import Button from '@/components/ui/button';
import StarRating from '@/components/survey/StarRating';

interface ReviewFormProps {
  onSubmit: (data: { rating: number; content: string; isAnonymous: boolean }) => Promise<void>;
  isSubmitted?: boolean;
}

export default function ReviewForm({ onSubmit, isSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isSubmitted) {
    return (
      <div className="text-center py-6">
        <div className="text-3xl mb-2">🙏</div>
        <p className="text-slate-600">후기를 작성해주셔서 감사합니다!</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !content.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ rating, content: content.trim(), isAnonymous });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">평점</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">후기</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="강의에 대한 후기를 남겨주세요..."
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="accent-blue-500"
        />
        익명으로 작성
      </label>
      <Button type="submit" loading={loading} className="w-full" disabled={rating === 0 || !content.trim()}>
        후기 등록
      </Button>
    </form>
  );
}
