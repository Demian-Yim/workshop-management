'use client';
import { useSessionStore } from '@/hooks/useSession';
import Badge from '@/components/ui/badge';

interface FacilitatorToolbarProps {
  sessionTitle?: string;
  sessionCode?: string;
  participantCount?: number;
  onToggleFullscreen?: () => void;
}

export default function FacilitatorToolbar({
  sessionTitle,
  sessionCode,
  participantCount = 0,
  onToggleFullscreen,
}: FacilitatorToolbarProps) {
  return (
    <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold">{sessionTitle || 'Workshop'}</h1>
        {sessionCode && (
          <Badge variant="info" className="bg-blue-600 text-white">
            CODE: {sessionCode}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span>{participantCount}명 접속중</span>
        </div>
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="text-slate-400 hover:text-white transition text-sm"
          >
            전체화면
          </button>
        )}
      </div>
    </div>
  );
}
