'use client';

import { useState } from 'react';
import { Plus, Play, Square, Trash2, BarChart2, MessageCircle, Cloud, ChevronDown, ChevronUp, Timer } from 'lucide-react';
import { useActivities } from '@/hooks/useActivities';
import { useSessionStore } from '@/hooks/useSession';
import PollView from '@/components/engagement/PollView';
import QAView from '@/components/engagement/QAView';
import WordCloudView from '@/components/engagement/WordCloudView';
import BreakTimer from '@/components/session/BreakTimer';
import { toast } from '@/components/ui/toast';
import type { ActivityType } from '@/types/engagement';

const TYPE_META: Record<ActivityType, { label: string; icon: typeof BarChart2; color: string }> = {
  poll: { label: '투표', icon: BarChart2, color: 'text-indigo-400' },
  qa: { label: 'Q&A', icon: MessageCircle, color: 'text-pink-400' },
  wordcloud: { label: '워드 클라우드', icon: Cloud, color: 'text-amber-400' },
  quiz: { label: '퀴즈', icon: BarChart2, color: 'text-green-400' },
  timer: { label: '타이머', icon: Play, color: 'text-blue-400' },
};

const CREATABLE: ActivityType[] = ['poll', 'qa', 'wordcloud'];

export default function FacilitatorActivitiesPage() {
  const { courseId, sessionId } = useSessionStore();
  const { activities, activeActivity, loading, saving, createActivity, activateActivity, deactivateAll, removeActivity } = useActivities();

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<ActivityType>('poll');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '', '']);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showTimer, setShowTimer] = useState(false);

  const sessionOk = !!(courseId && sessionId);

  const handleCreate = async () => {
    if (!title.trim()) { toast.error('제목을 입력해주세요'); return; }
    if (formType === 'poll' && pollOptions.filter(o => o.trim()).length < 2) {
      toast.error('투표 항목을 2개 이상 입력해주세요'); return;
    }
    try {
      await createActivity(formType, title.trim(), prompt.trim(), formType === 'poll' ? pollOptions : undefined);
      setTitle(''); setPrompt(''); setPollOptions(['', '', '']); setShowForm(false);
      toast.success('활동이 생성되었습니다');
    } catch {
      toast.error('활동 생성에 실패했습니다');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateActivity(id);
      toast.success('활동이 활성화되었습니다');
    } catch {
      toast.error('활성화에 실패했습니다');
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateAll();
      toast.success('활동이 종료되었습니다');
    } catch {
      toast.error('종료에 실패했습니다');
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('활동을 삭제하시겠습니까?')) return;
    try {
      await removeActivity(id);
      toast.success('삭제되었습니다');
    } catch {
      toast.error('삭제에 실패했습니다');
    }
  };

  if (!sessionOk) {
    return (
      <div className="animate-fade-in text-center py-20 text-slate-400">
        세션을 먼저 시작해주세요
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">라이브 활동</h1>
          <p className="text-slate-400 mt-1">투표 · Q&A · 워드 클라우드 · 타이머</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTimer(!showTimer)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              showTimer
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Timer className="w-4 h-4" />
            타이머
          </button>
          {activeActivity && (
            <button
              onClick={handleDeactivate}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm font-medium hover:bg-red-500/30 transition"
            >
              <Square className="w-4 h-4" />
              활동 종료
            </button>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            새 활동
          </button>
        </div>
      </div>

      {/* Break Timer Panel */}
      {showTimer && (
        <div className="mb-6">
          <BreakTimer />
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
          <h2 className="text-white font-semibold mb-4">활동 만들기</h2>
          <div className="flex gap-2 mb-4">
            {CREATABLE.map((t) => {
              const meta = TYPE_META[t];
              const Icon = meta.icon;
              return (
                <button
                  key={t}
                  onClick={() => setFormType(t)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
                    formType === t ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {meta.label}
                </button>
              );
            })}
          </div>
          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="활동 제목"
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="질문 또는 지시사항 (선택)"
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formType === 'poll' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">투표 항목</p>
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={opt}
                      onChange={(e) => {
                        const next = [...pollOptions];
                        next[i] = e.target.value;
                        setPollOptions(next);
                      }}
                      placeholder={`항목 ${i + 1}`}
                      className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}
                        className="text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 8 && (
                  <button
                    onClick={() => setPollOptions([...pollOptions, ''])}
                    className="text-xs text-blue-400 hover:text-blue-300 transition"
                  >
                    + 항목 추가
                  </button>
                )}
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCreate}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? '생성 중...' : '활동 생성'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>활동이 없습니다. 새 활동을 만들어보세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const meta = TYPE_META[activity.type] ?? TYPE_META.poll;
            const Icon = meta.icon;
            const isActive = activity.isActive;
            const isExpanded = expandedId === activity.id;

            return (
              <div
                key={activity.id}
                className={`bg-slate-800 rounded-xl border transition ${
                  isActive ? 'border-blue-500/50 bg-slate-800' : 'border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4 px-4 py-3">
                  <Icon className={`w-5 h-5 shrink-0 ${meta.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-slate-500 text-xs">{meta.label}</p>
                  </div>
                  {isActive && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-medium shrink-0">
                      진행 중
                    </span>
                  )}
                  <div className="flex items-center gap-1 shrink-0">
                    {!isActive ? (
                      <button
                        onClick={() => handleActivate(activity.id)}
                        title="활성화"
                        className="p-1.5 text-slate-400 hover:text-green-400 transition rounded-lg hover:bg-green-500/10"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleDeactivate}
                        title="종료"
                        className="p-1.5 text-blue-400 hover:text-red-400 transition rounded-lg hover:bg-red-500/10"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                      title="결과 보기"
                      className="p-1.5 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-700"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleRemove(activity.id)}
                      title="삭제"
                      className="p-1.5 text-slate-400 hover:text-red-400 transition rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-700 p-4">
                    {activity.type === 'poll' && (
                      <PollView activity={activity} participantId="facilitator" isPresenter dark />
                    )}
                    {activity.type === 'qa' && (
                      <QAView activity={activity} participantId="facilitator" participantName="퍼실리테이터" isPresenter dark />
                    )}
                    {activity.type === 'wordcloud' && (
                      <WordCloudView activity={activity} participantId="facilitator" isPresenter dark />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
