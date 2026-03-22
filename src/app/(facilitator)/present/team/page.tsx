'use client';
import { useState } from 'react';
import { collection, doc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useSessionStore } from '@/hooks/useSession';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import { assignTeams } from '@/lib/team-algorithm';
import { getTeamColor, generateId } from '@/lib/utils';
import type { Participant } from '@/types/session';
import type { Team } from '@/types/team';
import { toast } from '@/components/ui/toast';

export default function FacilitatorTeamPage() {
  const { courseId, sessionId } = useSessionStore();
  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '';
  const [numberOfTeams, setNumberOfTeams] = useState(4);
  const [assigning, setAssigning] = useState(false);

  const { data: participants } = useRealtimeCollection<Participant>(
    basePath ? `${basePath}/participants` : '', [], !!basePath
  );
  const { data: teams } = useRealtimeCollection<Team>(
    basePath ? `${basePath}/teams` : '', [], !!basePath
  );

  const handleRandomAssign = async () => {
    if (!basePath || participants.length === 0) return;
    setAssigning(true);
    try {
      const teamAssignments = assignTeams(participants, numberOfTeams);
      const batch = writeBatch(db);

      teamAssignments.forEach((team, index) => {
        const teamId = generateId();
        const teamRef = doc(db, `${basePath}/teams`, teamId);
        batch.set(teamRef, {
          teamName: team.teamName,
          memberIds: team.memberIds,
          memberNames: team.memberNames,
          color: getTeamColor(index),
          createdAt: serverTimestamp(),
        });

        team.memberIds.forEach((memberId) => {
          const participantRef = doc(db, `${basePath}/participants`, memberId);
          batch.update(participantRef, { teamId });
        });
      });

      await batch.commit();
    } catch (err) {
      console.error(err);
      toast.error('팀 배정에 실패했습니다');
    }
    setAssigning(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">팀 구성</h1>
          <p className="text-slate-400 mt-1">{participants.length}명의 학습자</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">랜덤 팀 배정</h2>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">팀 수</label>
            <input
              type="number"
              min={2}
              max={20}
              value={numberOfTeams}
              onChange={(e) => setNumberOfTeams(Number(e.target.value))}
              className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center"
            />
          </div>
          <div className="text-sm text-slate-500">
            팀당 약 {Math.ceil(participants.length / numberOfTeams)}명
          </div>
          <button
            onClick={handleRandomAssign}
            disabled={assigning || participants.length === 0}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition ml-auto"
          >
            {assigning ? '배정 중...' : '랜덤 배정'}
          </button>
        </div>
      </div>

      {/* Teams Display */}
      {teams.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {teams.map((team, idx) => (
            <div key={team.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="h-1.5" style={{ backgroundColor: team.color || getTeamColor(idx) }} />
              <div className="p-4">
                <h3 className="font-bold text-slate-200 mb-3">{team.teamName}</h3>
                <div className="space-y-1.5">
                  {team.memberNames.map((name, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold"
                        style={{ backgroundColor: team.color || getTeamColor(idx) }}
                      >
                        {name[0]}
                      </div>
                      <span className="text-sm text-slate-300">{name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">{team.memberNames.length}명</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-slate-500 text-lg">아직 팀이 구성되지 않았습니다</p>
        </div>
      )}
    </div>
  );
}
