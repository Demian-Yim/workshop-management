'use client';

import { cn } from '@/lib/utils';
import type { CheckInFlowStep } from '@/types/character';

const STEPS: { id: CheckInFlowStep; label: string }[] = [
  { id: 'checkin', label: '체크인' },
  { id: 'selfie', label: '셀카' },
  { id: 'character', label: '캐릭터' },
  { id: 'keywords', label: '키워드' },
  { id: 'intro-edit', label: '자기소개' },
];

const STEP_ORDER: CheckInFlowStep[] = STEPS.map((s) => s.id);

interface StepIndicatorProps {
  currentStep: CheckInFlowStep;
  className?: string;
}

export default function StepIndicator({ currentStep, className }: StepIndicatorProps) {
  // Map generating to character step for display purposes
  const displayStep = currentStep === 'generating' ? 'character' : currentStep;
  const currentIndex = STEP_ORDER.indexOf(displayStep);

  if (currentStep === 'complete') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        {STEPS.map((step) => (
          <div key={step.id} className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {step.id !== 'intro-edit' && <div className="w-6 h-0.5 bg-green-500" />}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = step.id === displayStep;

        return (
          <div key={step.id} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  isCompleted && 'bg-indigo-500 text-white',
                  isCurrent && 'bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-1',
                  !isCompleted && !isCurrent && 'bg-slate-200 text-slate-400'
                )}
              >
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] mt-0.5 whitespace-nowrap',
                  isCurrent ? 'text-indigo-600 font-semibold' : 'text-slate-400'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'w-5 h-0.5 mb-4',
                  isCompleted ? 'bg-indigo-500' : 'bg-slate-200'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
