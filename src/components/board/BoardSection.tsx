'use client';
import type { BoardSection } from '@/types/board';

interface BoardSectionProps {
  section: BoardSection;
  count?: number;
}

export default function BoardSectionHeader({ section, count }: BoardSectionProps) {
  const dotStyle = section.color
    ? { backgroundColor: section.color }
    : { backgroundColor: '#6366f1' };

  return (
    <div className="flex items-center gap-2 mb-3 px-1">
      <span className="h-3 w-3 rounded-full flex-shrink-0" style={dotStyle} />
      <h3 className="text-sm font-bold text-slate-700 tracking-wide uppercase">
        {section.title}
      </h3>
      {count !== undefined && (
        <span className="ml-auto text-xs text-slate-400 font-medium">{count}</span>
      )}
    </div>
  );
}
