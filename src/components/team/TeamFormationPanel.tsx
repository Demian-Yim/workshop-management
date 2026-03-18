'use client';
import { useState } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';

interface TeamFormationPanelProps {
  participantCount: number;
  onAssign: (numberOfTeams: number) => Promise<void>;
  onReset?: () => void;
  hasTeams: boolean;
}

export default function TeamFormationPanel({ participantCount, onAssign, onReset, hasTeams }: TeamFormationPanelProps) {
  const [numberOfTeams, setNumberOfTeams] = useState(4);
  const [loading, setLoading] = useState(false);

  const membersPerTeam = numberOfTeams > 0 ? Math.ceil(participantCount / numberOfTeams) : 0;

  const handleAssign = async () => {
    setLoading(true);
    try {
      await onAssign(numberOfTeams);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-1 block">팀 수</label>
          <Input
            type="number"
            min={2}
            max={Math.min(20, participantCount)}
            value={numberOfTeams}
            onChange={(e) => setNumberOfTeams(parseInt(e.target.value) || 2)}
          />
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-sm text-slate-400">
            참가자 {participantCount}명 / 팀당 약 {membersPerTeam}명
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleAssign} loading={loading} className="flex-1">
          {hasTeams ? '재배정' : '랜덤 팀 배정'}
        </Button>
        {hasTeams && onReset && (
          <Button variant="danger" onClick={onReset}>초기화</Button>
        )}
      </div>
    </div>
  );
}
