'use client';
import type { LunchMenuOption } from '@/types/lunch';

interface LunchMenuPollProps {
  options: LunchMenuOption[];
  voteCounts: Record<string, number>;
  totalVotes: number;
  selectedOption?: string;
  onVote: (optionId: string) => void;
}

export default function LunchMenuPoll({
  options,
  voteCounts,
  totalVotes,
  selectedOption,
  onVote,
}: LunchMenuPollProps) {
  return (
    <div className="space-y-3">
      {options.map((opt) => {
        const count = voteCounts[opt.id] || 0;
        const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        const isSelected = selectedOption === opt.id;

        return (
          <button
            key={opt.id}
            onClick={() => onVote(opt.id)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-slate-900">{opt.name}</span>
              <span className="text-sm text-slate-500">{count}표 ({percentage}%)</span>
            </div>
            {opt.description && (
              <p className="text-xs text-slate-500 mb-2">{opt.description}</p>
            )}
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  isSelected ? 'bg-blue-500' : 'bg-slate-300'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
