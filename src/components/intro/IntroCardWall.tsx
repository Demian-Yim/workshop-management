'use client';
import Masonry from 'react-masonry-css';
import IntroCard from './IntroCard';
import type { IntroCard as IntroCardType } from '@/types/intro';

interface IntroCardWallProps {
  intros: IntroCardType[];
  dark?: boolean;
  columns?: number;
}

const defaultBreakpoints = { default: 4, 1100: 3, 700: 2, 500: 1 };

export default function IntroCardWall({ intros, dark, columns }: IntroCardWallProps) {
  const breakpoints = columns
    ? { default: columns, 700: Math.min(columns, 2), 500: 1 }
    : defaultBreakpoints;

  if (intros.length === 0) {
    return (
      <div className={`text-center py-12 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        아직 자기소개가 없습니다
      </div>
    );
  }

  return (
    <Masonry
      breakpointCols={breakpoints}
      className="masonry-grid"
      columnClassName="masonry-grid-column"
    >
      {intros.map((intro) => (
        <IntroCard key={intro.id} intro={intro} dark={dark} />
      ))}
    </Masonry>
  );
}
