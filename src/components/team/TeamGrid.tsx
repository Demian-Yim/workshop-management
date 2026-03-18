'use client';
import TeamCard from './TeamCard';
import type { Team } from '@/types/team';

interface TeamGridProps {
  teams: Team[];
  myTeamId?: string;
  dark?: boolean;
}

export default function TeamGrid({ teams, myTeamId, dark }: TeamGridProps) {
  if (teams.length === 0) {
    return (
      <div className={`text-center py-12 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        아직 팀이 구성되지 않았습니다
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((team, index) => (
        <TeamCard
          key={team.id}
          team={team}
          index={index}
          isMyTeam={team.id === myTeamId}
          dark={dark}
        />
      ))}
    </div>
  );
}
