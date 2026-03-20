'use client';
import { useState } from 'react';
import Button from '@/components/ui/button';
import StarRating from './StarRating';
import type { SurveyQuestion } from '@/types/survey';

interface SurveyFormProps {
  questions: SurveyQuestion[];
  onSubmit: (responses: { questionId: string; rating?: number; text?: string }[]) => Promise<void>;
  isSubmitted?: boolean;
}

export default function SurveyForm({ questions, onSubmit, isSubmitted }: SurveyFormProps) {
  const [responses, setResponses] = useState<Record<string, { rating?: number; text?: string }>>({});
  const [loading, setLoading] = useState(false);

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🎉</div>
        <p className="text-slate-600 font-semibold">설문을 완료했습니다!</p>
        <p className="text-sm text-slate-500 mt-1">소중한 의견 감사합니다</p>
      </div>
    );
  }

  const updateResponse = (qId: string, field: 'rating' | 'text', value: number | string) => {
    setResponses((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = questions.map((q) => ({
      questionId: q.id,
      rating: responses[q.id]?.rating,
      text: responses[q.id]?.text,
    }));
    setLoading(true);
    try {
      await onSubmit(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((q) => (
        <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="font-medium text-slate-900 mb-3">{q.text}</p>
          {q.type === 'rating' && (
            <StarRating
              value={responses[q.id]?.rating || 0}
              onChange={(v) => updateResponse(q.id, 'rating', v)}
            />
          )}
          {q.type === 'text' && (
            <textarea
              value={responses[q.id]?.text || ''}
              onChange={(e) => updateResponse(q.id, 'text', e.target.value)}
              placeholder="의견을 작성해주세요..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              rows={3}
            />
          )}
          {q.type === 'multipleChoice' && q.options && (
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    onChange={() => updateResponse(q.id, 'text', opt)}
                    className="accent-blue-500"
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
      <Button type="submit" loading={loading} className="w-full">설문 제출</Button>
    </form>
  );
}
