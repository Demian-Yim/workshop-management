'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useWordCloud } from '@/hooks/useWordCloud';
import type { Activity } from '@/types/engagement';

interface WordCloudViewProps {
  activity: Activity;
  participantId: string;
  isPresenter?: boolean;
  dark?: boolean;
}

const CLOUD_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6',
  '#f97316', '#84cc16',
];

function fontSize(count: number, max: number): number {
  if (max <= 1) return 20;
  return Math.round(14 + ((count - 1) / (max - 1)) * 38);
}

export default function WordCloudView({
  activity,
  participantId,
  isPresenter = false,
  dark,
}: WordCloudViewProps) {
  const { frequencies, loading, submitting, submitWord, myEntries } = useWordCloud(activity.id);
  const [draft, setDraft] = useState('');

  const maxCount = frequencies.length > 0 ? frequencies[0].count : 1;
  const mine = myEntries(participantId);
  const hasSubmitted = mine.length > 0;

  const handleSubmit = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    await submitWord(trimmed, participantId);
    setDraft('');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <p className={`text-sm font-semibold ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
          {activity.prompt ?? '워드 클라우드'}
        </p>
        <h3 className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
          {activity.title}
        </h3>
      </div>

      {/* Cloud display */}
      <div
        className={`rounded-2xl min-h-36 p-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 ${
          dark ? 'bg-slate-800' : 'bg-slate-50 border border-slate-200'
        }`}
      >
        {loading && (
          <span className={`text-sm ${dark ? 'text-slate-500' : 'text-slate-400'}`}>로딩 중…</span>
        )}
        {!loading && frequencies.length === 0 && (
          <span className={`text-sm ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            아직 단어가 없습니다
          </span>
        )}
        {frequencies.map(({ word, count }, i) => (
          <span
            key={word}
            className="font-bold leading-tight select-none"
            style={{
              fontSize: `${fontSize(count, maxCount)}px`,
              color: CLOUD_COLORS[i % CLOUD_COLORS.length],
              opacity: 0,
              animation: `wordFadeIn 0.5s ease forwards`,
              animationDelay: `${i * 60}ms`,
              textShadow: `0 0 20px ${CLOUD_COLORS[i % CLOUD_COLORS.length]}55`,
            }}
          >
            {word}
          </span>
        ))}
      </div>

      {/* Composer */}
      {!isPresenter && (
        <div className={`rounded-xl p-3 flex gap-2 ${dark ? 'bg-slate-800' : 'bg-slate-50 border border-slate-200'}`}>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            placeholder={hasSubmitted ? '단어 추가…' : '단어를 입력하세요…'}
            maxLength={20}
            className={`flex-1 bg-transparent text-sm outline-none ${
              dark ? 'text-slate-200 placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
            }`}
          />
          <button
            type="button"
            disabled={!draft.trim() || submitting}
            onClick={handleSubmit}
            className="rounded-lg p-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      {frequencies.length > 0 && (
        <p className={`text-center text-xs ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
          {frequencies.length}개 단어 · 총 {frequencies.reduce((s, f) => s + f.count, 0)}개 제출
        </p>
      )}
    </div>
  );
}
