'use client';

import { Lock } from 'lucide-react';

interface FeatureClosedProps {
  message?: string;
}

/**
 * Full-page placeholder shown when a session feature is disabled by the facilitator.
 */
export default function FeatureClosed({ message = '강사가 이 기능을 아직 열지 않았습니다' }: FeatureClosedProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
        <Lock className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-700 mb-1">기능 준비 중</h3>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
