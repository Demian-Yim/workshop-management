'use client';
import Avatar from '@/components/ui/avatar';
import { getTeamColor } from '@/lib/utils';
import type { Team } from '@/types/team';

interface TeamCardProps {
  team: Team;
  index: number;
  isMyTeam?: boolean;
  dark?: boolean;
}

export default function TeamCard({ team, index, isMyTeam, dark }: TeamCardProps) {
  const color = getTeamColor(index);

  return (
    <div
      className={`rounded-xl p-4 border-2 transition-all ${
        isMyTeam ? 'ring-2 ring-yellow-400 border-yellow-400' : 'border-transparent'
      } ${dark ? 'bg-slate-800' : 'bg-white shadow-sm'}`}
      style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
          {team.teamName}
          {isMyTeam && <span className="ml-2 text-yellow-500 text-xs">내 팀</span>}
        </h3>
        <span className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          {team.memberIds.length}명
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {team.memberNames.map((name, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Avatar name={name} size="sm" />
            <span className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
