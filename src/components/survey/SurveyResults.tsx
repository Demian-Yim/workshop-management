'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SurveyQuestion, SurveyResponse } from '@/types/survey';

interface SurveyResultsProps {
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
}

export default function SurveyResults({ questions, responses }: SurveyResultsProps) {
  const ratingQuestions = questions.filter((q) => q.type === 'rating');
  const textQuestions = questions.filter((q) => q.type === 'text');

  const chartData = ratingQuestions.map((q) => {
    const ratings = responses
      .flatMap((r) => r.responses)
      .filter((item) => item.questionId === q.id && item.rating)
      .map((item) => item.rating!);
    const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    return { name: q.text.length > 15 ? q.text.slice(0, 15) + '...' : q.text, average: parseFloat(avg.toFixed(1)) };
  });

  const textResponses = textQuestions.flatMap((q) =>
    responses
      .flatMap((r) => r.responses)
      .filter((item) => item.questionId === q.id && item.text)
      .map((item) => item.text!)
  );

  const overallAvg =
    chartData.length > 0
      ? (chartData.reduce((sum, d) => sum + d.average, 0) / chartData.length).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="text-5xl font-bold text-amber-400">{overallAvg}</div>
        <p className="text-slate-400 text-sm mt-1">전체 평균 (응답 {responses.length}명)</p>
      </div>

      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" domain={[0, 5]} stroke="#94a3b8" />
            <YAxis dataKey="name" type="category" stroke="#94a3b8" width={120} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey="average" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {textResponses.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-3">서술형 응답</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {textResponses.map((text, i) => (
              <div key={i} className="bg-slate-800 rounded-lg p-3 text-sm text-slate-300">
                {text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
