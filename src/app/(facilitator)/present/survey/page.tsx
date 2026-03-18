'use client';
import { useSessionStore } from '@/hooks/useSession';
import { useSurveyResults } from '@/hooks/useSurveyResults';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const questionLabels: Record<string, string> = {
  q1: '교육 내용의 전문성',
  q2: '강사의 전달력',
  q3: '교육 자료의 적절성',
  q4: '실습/활동의 유용성',
  q5: '전반적 만족도',
};

export default function FacilitatorSurveyPage() {
  const { courseId, sessionId, sessionData } = useSessionStore();
  const { responses, responseCount, averageOverall } = useSurveyResults();
  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '';

  const toggleSurvey = async () => {
    if (!basePath) return;
    await updateDoc(doc(db, basePath), { 'settings.surveyOpen': !sessionData?.settings?.surveyOpen });
  };

  // Aggregate by question
  const questionAverages = Object.keys(questionLabels).map((qId) => {
    const ratings = responses
      .flatMap((r) => r.responses)
      .filter((r) => r.questionId === qId && r.rating !== null)
      .map((r) => r.rating as number);
    const avg = ratings.length > 0 ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : 0;
    return { question: questionLabels[qId], average: avg };
  });

  // Text responses (q6)
  const textResponses = responses
    .flatMap((r) => r.responses)
    .filter((r) => r.questionId === 'q6' && r.text)
    .map((r) => r.text as string);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">만족도 설문</h1>
          <p className="text-slate-400 mt-1">{responseCount}명 응답</p>
        </div>
        <div className="flex items-center gap-4">
          {responseCount > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">⭐ {averageOverall}</div>
              <p className="text-xs text-slate-500">평균 점수</p>
            </div>
          )}
          <button
            onClick={toggleSurvey}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              sessionData?.settings?.surveyOpen
                ? 'bg-red-500/20 text-red-300'
                : 'bg-green-500/20 text-green-300'
            }`}
          >
            {sessionData?.settings?.surveyOpen ? '설문 마감' : '설문 시작'}
          </button>
        </div>
      </div>

      {responseCount === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-slate-500 text-lg">아직 응답이 없습니다</p>
          <p className="text-slate-600 text-sm mt-1">설문을 열고 학습자들의 응답을 기다려주세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">항목별 평균 점수</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={questionAverages} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" domain={[0, 5]} stroke="#94A3B8" fontSize={12} />
                  <YAxis type="category" dataKey="question" stroke="#94A3B8" fontSize={11} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#E2E8F0' }}
                  />
                  <Bar dataKey="average" fill="#818CF8" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">건의사항 및 의견</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {textResponses.length === 0 ? (
                <p className="text-slate-500">아직 텍스트 응답이 없습니다</p>
              ) : (
                textResponses.map((text, i) => (
                  <div key={i} className="bg-slate-700/50 rounded-lg p-3 text-sm text-slate-300">
                    {text}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
