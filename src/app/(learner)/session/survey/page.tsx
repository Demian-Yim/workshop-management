'use client';
import { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { useSessionStore } from '@/hooks/useSession';
import { useRealtimeDocument } from '@/hooks/useRealtimeDocument';
import StarRating from '@/components/survey/StarRating';
import Button from '@/components/ui/button';
import type { SurveyResponse } from '@/types/survey';

const defaultQuestions = [
  { id: 'q1', text: '교육 내용의 전문성', type: 'rating' as const },
  { id: 'q2', text: '강사의 전달력', type: 'rating' as const },
  { id: 'q3', text: '교육 자료의 적절성', type: 'rating' as const },
  { id: 'q4', text: '실습/활동의 유용성', type: 'rating' as const },
  { id: 'q5', text: '전반적 만족도', type: 'rating' as const },
  { id: 'q6', text: '건의사항 및 의견', type: 'text' as const },
];

const ratingQuestions = defaultQuestions.filter((q) => q.type === 'rating');

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

  const answeredCount = ratingQuestions.filter((q) => (responses[q.id] as number) > 0).length;
  const progress = ratingQuestions.length > 0
    ? Math.round((answeredCount / ratingQuestions.length) * 100)
    : 0;

  const handleSubmit = async () => {
    if (!basePath || !participantId) return;
    setSaving(true);
    try {
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 animate-scale-in">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">설문 제출 완료</h2>
        <p className="text-slate-500">소중한 의견 감사합니다!</p>
        <div className="mt-4 flex justify-center">
          <StarRating value={Math.round(myResponse.overallRating)} readOnly size="md" />
        </div>
        <p className="text-sm text-slate-400 mt-1">평균 {myResponse.overallRating}점</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-lg font-bold text-slate-900">만족도 설문</h2>
        <p className="text-sm text-slate-500 mt-1">각 항목을 평가해 주세요</p>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>{answeredCount}/{ratingQuestions.length} 항목 응답</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {defaultQuestions.map((q) => (
          <div key={q.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">{q.text}</label>
            {q.type === 'rating' ? (
              <StarRating
                value={(responses[q.id] as number) || 0}
                onChange={(v) => setRating(q.id, v)}
              />
            ) : (
              <textarea
                value={(responses[q.id] as string) || ''}
                onChange={(e) => setText(q.id, e.target.value)}
                placeholder="자유롭게 작성해 주세요..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none transition resize-none text-sm"
              />
            )}
          </div>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        loading={saving}
        size="lg"
        className="w-full"
      >
        설문 제출하기
      </Button>
    </div>
  );
}
