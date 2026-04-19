'use client';

import { BarChart2, MessageCircle, Cloud } from 'lucide-react';
import { useActivities } from '@/hooks/useActivities';
import { useSessionStore } from '@/hooks/useSession';
import PollView from '@/components/engagement/PollView';
import QAView from '@/components/engagement/QAView';
import WordCloudView from '@/components/engagement/WordCloudView';

export default function LearnerActivitiesPage() {
  const { participantId, participantName } = useSessionStore();
  const { activeActivity, loading } = useActivities();

  const pid = participantId || participantName || 'anon';
  const pname = participantName || '참가자';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!activeActivity) {
    return (
      <div className="text-center py-20">
        <BarChart2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <h2 className="text-slate-600 font-semibold mb-1">진행 중인 활동 없음</h2>
        <p className="text-slate-400 text-sm">퍼실리테이터가 활동을 시작하면 여기에 표시됩니다</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="flex items-center gap-2 mb-4">
        {activeActivity.type === 'poll' && <BarChart2 className="w-5 h-5 text-indigo-500" />}
        {activeActivity.type === 'qa' && <MessageCircle className="w-5 h-5 text-pink-500" />}
        {activeActivity.type === 'wordcloud' && <Cloud className="w-5 h-5 text-amber-500" />}
        <h2 className="font-bold text-slate-900">{activeActivity.title}</h2>
        <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">진행 중</span>
      </div>

      {activeActivity.type === 'poll' && (
        <PollView activity={activeActivity} participantId={pid} />
      )}
      {activeActivity.type === 'qa' && (
        <QAView activity={activeActivity} participantId={pid} participantName={pname} />
      )}
      {activeActivity.type === 'wordcloud' && (
        <WordCloudView activity={activeActivity} participantId={pid} />
      )}
    </div>
  );
}
