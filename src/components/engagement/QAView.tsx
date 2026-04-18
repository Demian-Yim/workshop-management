'use client';

import { useState } from 'react';
import { ThumbsUp, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import { useQA } from '@/hooks/useQA';
import type { Activity } from '@/types/engagement';

interface QAViewProps {
  activity: Activity;
  participantId: string;
  participantName: string;
  isPresenter?: boolean;
  dark?: boolean;
}

export default function QAView({
  activity,
  participantId,
  participantName,
  isPresenter = false,
  dark,
}: QAViewProps) {
  const { questions, unanswered, answered, loading, submitting, submitQuestion, toggleUpvote, markAnswered } =
    useQA(activity.id);
  const [draft, setDraft] = useState('');
  const [showAnswered, setShowAnswered] = useState(false);

  const displayList = showAnswered ? answered : unanswered;

  const handleSubmit = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    await submitQuestion(trimmed, participantId, participantName);
    setDraft('');
  };

  return (
    <div className={`rounded-2xl flex flex-col gap-4 ${dark ? '' : ''}`}>
      {/* Header */}
      <div>
        <p className={`text-sm font-semibold ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
          {activity.prompt ?? 'Q&A'}
        </p>
        <h3 className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
          {activity.title}
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setShowAnswered(false)}
          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
            !showAnswered
              ? dark
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-100 text-indigo-700'
              : dark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          미답변 {unanswered.length}
        </button>
        <button
          type="button"
          onClick={() => setShowAnswered(true)}
          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
            showAnswered
              ? dark
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-100 text-emerald-700'
              : dark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          답변완료 {answered.length}
        </button>
      </div>

      {/* Question list */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {loading && (
          <p className={`text-center text-sm py-6 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            로딩 중…
          </p>
        )}
        {!loading && displayList.length === 0 && (
          <p className={`text-center text-sm py-6 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            {showAnswered ? '답변된 질문이 없습니다' : '아직 질문이 없습니다'}
          </p>
        )}
        {displayList.map((q) => {
          const hasUpvoted = q.upvotedBy.includes(participantId);
          return (
            <div
              key={q.id}
              className={`rounded-xl p-3 flex gap-3 ${
                dark ? 'bg-slate-800' : 'bg-slate-50 border border-slate-100'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${dark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {q.content}
                </p>
                <p className={`mt-1 text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {q.authorName}
                </p>
              </div>
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => toggleUpvote(q.id, participantId)}
                  className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 transition-colors ${
                    hasUpvoted
                      ? dark
                        ? 'text-indigo-400'
                        : 'text-indigo-600'
                      : dark
                        ? 'text-slate-500 hover:text-slate-300'
                        : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-xs font-semibold">{q.upvoteCount}</span>
                </button>
                {isPresenter && !q.answered && (
                  <button
                    type="button"
                    onClick={() => markAnswered(q.id)}
                    title="답변 완료"
                    className={`rounded-lg p-1 transition-colors ${
                      dark
                        ? 'text-slate-500 hover:text-emerald-400'
                        : 'text-slate-400 hover:text-emerald-600'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer (participants only) */}
      {!isPresenter && (
        <div className={`rounded-xl p-3 flex gap-2 ${dark ? 'bg-slate-800' : 'bg-slate-50 border border-slate-200'}`}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
            }}
            placeholder="질문을 입력하세요…"
            rows={2}
            className={`flex-1 resize-none bg-transparent text-sm outline-none ${
              dark ? 'text-slate-200 placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
            }`}
          />
          <button
            type="button"
            disabled={!draft.trim() || submitting}
            onClick={handleSubmit}
            className="self-end rounded-lg p-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <p className={`text-center text-xs ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
        총 {questions.length}개 질문
      </p>
    </div>
  );
}
