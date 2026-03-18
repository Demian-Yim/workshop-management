'use client';
import Badge from '@/components/ui/badge';

interface AttendanceStatusProps {
  checkedIn: number;
  total: number;
}

export default function AttendanceStatus({ checkedIn, total }: AttendanceStatusProps) {
  const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-slate-700">출석 현황</span>
          <span className="text-slate-500">{checkedIn}/{total}명</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <Badge variant={percentage >= 80 ? 'success' : percentage >= 50 ? 'warning' : 'danger'}>
        {percentage}%
      </Badge>
    </div>
  );
}
