'use client';
import Badge from '@/components/ui/badge';

interface LearnerHeaderProps {
  sessionTitle?: string;
  participantName?: string;
  sessionCode?: string;
}

export default function LearnerHeader({ sessionTitle, participantName, sessionCode }: LearnerHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-slate-900 truncate max-w-[200px]">
            {sessionTitle || 'Workshop'}
          </h1>
          {sessionCode && (
            <Badge variant="info">{sessionCode}</Badge>
          )}
        </div>
        {participantName && (
          <span className="text-sm text-slate-600 font-medium">{participantName}</span>
        )}
      </div>
    </header>
  );
}
