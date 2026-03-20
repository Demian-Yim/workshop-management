'use client';
import Avatar from '@/components/ui/avatar';
import type { IntroCard as IntroCardType } from '@/types/intro';

interface IntroCardProps {
  intro: IntroCardType;
  dark?: boolean;
}

export default function IntroCard({ intro, dark }: IntroCardProps) {
  return (
    <div className={`p-4 rounded-xl ${dark ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200'}`}>
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={intro.participantName} imageUrl={intro.photoUrl} size="sm" />
        <span className={`font-semibold text-sm ${dark ? 'text-white' : 'text-slate-900'}`}>
          {intro.participantName}
        </span>
      </div>
      <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
        {intro.content}
      </p>
      {intro.tags && intro.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {intro.tags.map((tag) => (
            <span
              key={tag}
              className={`px-2 py-0.5 rounded-full text-xs ${dark ? 'bg-slate-700 text-slate-300' : 'bg-blue-50 text-blue-600'}`}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
