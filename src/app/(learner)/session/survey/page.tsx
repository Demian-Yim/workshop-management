'use client';
import { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useSessionStore } from '@/hooks/useSession';
import { useRealtimeDocument } from '@/hooks/useRealtimeDocument';
import type { SurveyResponse } from '@/types/survey';

const defaultQuestions = [
  { id: 'q1', text: '교육 내용의 전문성', type: 'rating' as const },
  { id: 'q2', text: '강사의 전달력', type: 'rating' as const },
  { id: 'q3', text: '교육 자료의 적절성', type: 'rating' as const },
  { id: 'q4', text: '실습/활동의 유용성', type: 'rating' as const },
  { id: 'q5', text: '전반적 만족도', type: 'rating' as const },
  { id: 'q6', text: '건의사항 및 의견', type: 'text' as const },
];

export default function SurveyPage() {
  const { courseId, sessionId, participantId } = useSessionStore();
  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '';

  const [responses, setResponses] = useState<Record<string, number | string>>({});
  const [saving, setSaving] = useState(false);

  const { data: myResponse } = useRealtimeDocument<SurveyResponse>(
    basePath && participantId ? `${basePath}/surveyResponses/${participantId}` : '',
    !!(basePath && participantId)
  );

  const setRating = (questionId: string, value: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const setText = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!basePath || !participantId) return;
    setSaving(true);
    try {
      const ratingQuestions = defaultQuestions.filter((q) => q.type === 'rating');
      const ratings = ratingQuestions.map((q) => (responses[q.id] as number) || 0);
      const overallRating = ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : 0;

      await setDoc(doc(db, `${basePath}/surveyResponses`, participantId), {
        responses: defaultQuestions.map((q) => ({
          questionId: q.id,
          rating: q.type === 'rating' ? (responses[q.id] as number) || 0 : null,
          text: q.type === 'text' ? (responses[q.id] as string) || '' : null,
        })),
        overallRating,
        submittedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  if (myResponse) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">설문 제출 완료</h2>
        <p className="text-slate-500">소중한 의견 감사합니다!</p>
        <div className="mt-4 text-2xl">{'⭐'.repeat(Math.round(myResponse.overallRating))}</div>
        <p className="text-sm text-slate-400 mt-1">평균 {myResponse.overallRating}점</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-lg font-bold text-slate-900">📊 만족도 설문</h2>
        <p className="text-sm text-slate-500 mt-1">각 항목을 평가해 주세요</p>
      </div>

      <div className="space-y-4">
        {defaultQuestions.map((q) => (
          <div key={q.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">{q.text}</label>
            {q.type === 'rating' ? (
              <div className="flex gap-1 star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(q.id, star)}
                    className="text-2xl"
                  >
                    {star <= ((responses[q.id] as number) || 0) ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                value={(responses[q.id] as string) || ''}
                onChange={(e) => setText(q.id, e.target.value)}
                placeholder="자유롭게 작성해 주세요..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none transition resize-none text-sm"
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition text-lg"
      >
        {saving ? '제출 중...' : '설문 제출하기'}
      </button>
    </div>
  );
}
