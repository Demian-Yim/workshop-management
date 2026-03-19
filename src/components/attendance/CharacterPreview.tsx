'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/button';

interface CharacterPreviewProps {
  selfieUrl: string | null;
  characterBase64: string | null;
  generating: boolean;
  error: string | null;
  onGenerate: (style: 'cartoon' | 'anime' | 'pixel') => void;
  onConfirm: () => void;
  onSkip: () => void;
  className?: string;
}

const STYLES: { id: 'cartoon' | 'anime' | 'pixel'; label: string; emoji: string }[] = [
  { id: 'cartoon', label: '카툰', emoji: '🎨' },
  { id: 'anime', label: '애니메', emoji: '✨' },
  { id: 'pixel', label: '픽셀', emoji: '👾' },
];

export default function CharacterPreview({
  selfieUrl,
  characterBase64,
  generating,
  error,
  onGenerate,
  onConfirm,
  onSkip,
  className,
}: CharacterPreviewProps) {
  const [selectedStyle, setSelectedStyle] = useState<'cartoon' | 'anime' | 'pixel'>('cartoon');

  const handleGenerate = () => {
    onGenerate(selectedStyle);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-900">AI 캐릭터 생성</h3>
        <p className="text-sm text-slate-500 mt-1">
          셀카를 기반으로 나만의 캐릭터를 만들어보세요
        </p>
      </div>

      {/* Style selector */}
      <div className="flex justify-center gap-2">
        {STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => setSelectedStyle(style.id)}
            disabled={generating}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              selectedStyle === style.id
                ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {style.emoji} {style.label}
          </button>
        ))}
      </div>

      {/* Preview area */}
      <div className="flex items-center justify-center gap-4">
        {/* Selfie */}
        {selfieUrl && (
          <div className="text-center">
            <div className="w-32 h-32 rounded-xl overflow-hidden bg-slate-100">
              <img src={selfieUrl} alt="셀카" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs text-slate-400 mt-1">원본</p>
          </div>
        )}

        {/* Arrow */}
        {selfieUrl && (
          <div className="text-slate-300 text-2xl">→</div>
        )}

        {/* Character */}
        <div className="text-center">
          <div className="w-32 h-32 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
            {generating ? (
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full mx-auto" />
                <p className="text-xs text-slate-400 mt-2">생성 중...</p>
              </div>
            ) : characterBase64 ? (
              <img
                src={`data:image/png;base64,${characterBase64}`}
                alt="캐릭터"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-300 text-4xl">?</div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">캐릭터</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-3">
        {characterBase64 ? (
          <>
            <Button variant="secondary" onClick={handleGenerate} disabled={generating}>
              다시 생성
            </Button>
            <Button onClick={onConfirm}>이 캐릭터 사용</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={onSkip} disabled={generating}>
              건너뛰기
            </Button>
            <Button onClick={handleGenerate} loading={generating}>
              캐릭터 생성
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
