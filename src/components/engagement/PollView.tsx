'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { usePollVotes } from '@/hooks/usePoll';
import type { Activity } from '@/types/engagement';

interface PollViewProps {
  activity: Activity;
  participantId: string;
  isPresenter?: boolean;
  dark?: boolean;
}

const BAR_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6'];

export default function PollView({ activity, participantId, isPresenter = false, dark }: PollViewProps) {
  const { votes, voteCounts, voting, myVote, castVote } = usePollVotes(activity.id);
  const options = activity.options ?? [];
  const totalVotes = votes.length;
  const currentVote = myVote(participantId);

  const chartData = useMemo(
    () =>
      options.map((opt) => ({
        name: opt.text.length > 14 ? opt.text.slice(0, 14) + '…' : opt.text,
        fullName: opt.text,
        votes: voteCounts[opt.id] ?? 0,
        id: opt.id,
      })),
    [options, voteCounts]
  );

  if (isPresenter) {
    return (
      <div className={`rounded-2xl p-5 ${dark ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
        <p className={`text-sm font-semibold mb-1 ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
          {activity.prompt ?? '투표'}
        </p>
        <h3 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-slate-900'}`}>
          {activity.title}
        </h3>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 4 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: dark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: dark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: dark ? '#1e293b' : '#fff',
                  border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value, _name, props) => [
                  `${value ?? 0}표`,
                  (props.payload as { fullName?: string } | undefined)?.fullName ?? '',
                ]}
                labelFormatter={() => ''}
              />
              <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className={`text-center text-xs mt-2 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
          총 {totalVotes}명 투표
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-5 ${dark ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
      <p className={`text-sm font-semibold mb-1 ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
        {activity.prompt ?? '투표'}
      </p>
      <h3 className={`text-lg font-bold mb-4 ${dark ? 'text-white' : 'text-slate-900'}`}>
        {activity.title}
      </h3>

      <div className="space-y-2.5">
        {options.map((opt, i) => {
          const count = voteCounts[opt.id] ?? 0;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const selected = currentVote?.optionId === opt.id;
          const color = BAR_COLORS[i % BAR_COLORS.length];

          return (
            <button
              key={opt.id}
              type="button"
              disabled={voting}
              onClick={() => castVote(opt.id, participantId)}
              className={`relative w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-300 overflow-hidden
                ${selected
                  ? 'text-white scale-[1.01] shadow-lg'
                  : dark
                    ? 'bg-slate-700 text-slate-200 hover:bg-slate-600 hover:scale-[1.005]'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:scale-[1.005]'
                }
                ${voting ? 'cursor-not-allowed opacity-60' : ''}`}
              style={selected ? { backgroundColor: color, boxShadow: `0 4px 16px ${color}55` } : undefined}
            >
              {/* Progress fill — always shown, animates width */}
              {totalVotes > 0 && (
                <span
                  className="absolute inset-y-0 left-0 rounded-xl transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                    opacity: selected ? 0.35 : 0.18,
                  }}
                />
              )}
              <span className="relative flex items-center justify-between gap-2">
                <span className="flex-1 truncate">{opt.text}</span>
                {totalVotes > 0 && (
                  <span
                    className={`text-xs tabular-nums font-semibold shrink-0 transition-all duration-500 ${
                      selected ? 'text-white/90' : dark ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    {pct}%
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {currentVote && (
        <p className={`mt-3 text-center text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
          투표 완료 · {totalVotes}명 참여
        </p>
      )}
    </div>
  );
}
