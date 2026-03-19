'use client';
import { Users } from 'lucide-react';
import { useSessionStore } from '@/hooks/useSession';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import { SkeletonList } from '@/components/ui/skeleton';
import EmptyState from '@/components/ui/empty-state';
import type { Team } from '@/types/team';
import { getTeamColor } from '@/lib/utils';

export default function TeamPage() {
  const { courseId, sessionId, participantId } = useSessionStore();
  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}/teams` : '';

  const { data: teams, loading } = useRealtimeCollection<Team>(basePath, [], !!basePath);

  const myTeam = teams.find((t) => t.memberIds.includes(participantId));

  if (loading) {
    return <SkeletonList count={2} />;
  }

  if (teams.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="팀 구성 대기"
        description="강사가 팀을 구성하면 여기에 표시됩니다"
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {myTeam && (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-indigo-200 overflow-hidden">
          <div className="p-1" style={{ backgroundColor: getTeamColor(teams.indexOf(myTeam)) }}>
            <div className="bg-white rounded-t-xl" />
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: getTeamColor(teams.indexOf(myTeam)) }}
              >
                {myTeam.teamName[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{myTeam.teamName}</h2>
                <p className="text-sm text-slate-500">{myTeam.memberNames.length}명</p>
              </div>
              <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-medium">내 팀</span>
            </div>
            <div className="space-y-2">
              {myTeam.memberNames.map((name, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-600">
                    {name[0]}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{name}</span>
                  {myTeam.memberIds[i] === participantId && (
                    <span className="text-xs text-indigo-500">(나)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <h3 className="text-sm font-semibold text-slate-500">전체 팀 ({teams.length}팀)</h3>
      <div className="grid grid-cols-1 gap-3">
        {teams.map((team, idx) => (
          <div
            key={team.id}
            className={`bg-white rounded-xl p-4 shadow-sm border ${
              team.id === myTeam?.id ? 'border-indigo-300' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-md"
                style={{ backgroundColor: getTeamColor(idx) }}
              />
              <span className="font-semibold text-sm">{team.teamName}</span>
              <span className="text-xs text-slate-400 ml-auto">{team.memberNames.length}명</span>
            </div>
            <p className="text-xs text-slate-500">{team.memberNames.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
