'use client';

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useSessionStore } from '@/hooks/useSession';
import { useCheckInFlow } from '@/hooks/useCheckInFlow';
import { useCharacterGeneration } from '@/hooks/useCharacterGeneration';
import StepIndicator from './StepIndicator';
import SelfieCapture from './SelfieCapture';
import CharacterPreview from './CharacterPreview';
import KeywordSelector from '@/components/intro/KeywordSelector';
import AutoIntroGenerator from '@/components/intro/AutoIntroGenerator';
import Button from '@/components/ui/button';

interface CheckInFlowProps {
  className?: string;
}

export default function CheckInFlow({ className }: CheckInFlowProps) {
  const { participantName } = useSessionStore();
  const {
    state,
    completeCheckIn,
    saveSelfie,
    saveCharacter,
    setKeywords,
    saveIntro,
    skipStep,
    canGoBack,
    goBack,
    goToStep,
  } = useCheckInFlow();

  const {
    generating,
    characterImageBase64,
    error: characterError,
    generate: generateCharacter,
    reset: resetCharacter,
  } = useCharacterGeneration();

  const handleCheckIn = useCallback(async () => {
    await completeCheckIn();
  }, [completeCheckIn]);

  const handleSelfieCapture = useCallback(
    async (dataUrl: string) => {
      await saveSelfie(dataUrl);
      // Auto-trigger character generation with default style
      generateCharacter(dataUrl, 'cartoon');
    },
    [saveSelfie, generateCharacter]
  );

  const handleCharacterGenerate = useCallback(
    async (style: 'cartoon' | 'anime' | 'pixel') => {
      if (!state.selfieUrl) return;
      resetCharacter();
      const result = await generateCharacter(state.selfieUrl, style);
      if (result) {
        await saveCharacter(result);
      }
    },
    [state.selfieUrl, generateCharacter, resetCharacter, saveCharacter]
  );

  const handleCharacterConfirm = useCallback(() => {
    goToStep('keywords');
  }, [goToStep]);

  const handleCharacterSkip = useCallback(() => {
    goToStep('keywords');
  }, [goToStep]);

  const handleKeywordsNext = useCallback(() => {
    goToStep('intro-edit');
  }, [goToStep]);

  const handleIntroSave = useCallback(
    async (content: string) => {
      await saveIntro(content);
    },
    [saveIntro]
  );

  return (
    <div className={cn('max-w-lg mx-auto space-y-6', className)}>
      <StepIndicator currentStep={state.currentStep} />

      {/* Step: Check-in */}
      {state.currentStep === 'checkin' && (
        <div className="text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">출석 체크</h2>
            <p className="text-slate-500 mt-2">
              버튼을 눌러 출석을 확인해주세요
            </p>
          </div>
          <Button size="lg" onClick={handleCheckIn} className="px-10">
            출석하기
          </Button>
        </div>
      )}

      {/* Step: Selfie */}
      {state.currentStep === 'selfie' && (
        <SelfieCapture
          onCapture={handleSelfieCapture}
          onSkip={skipStep}
        />
      )}

      {/* Step: Generating / Character */}
      {(state.currentStep === 'generating' || state.currentStep === 'character') && (
        <CharacterPreview
          selfieUrl={state.selfieUrl}
          characterBase64={characterImageBase64}
          generating={generating}
          error={characterError}
          onGenerate={handleCharacterGenerate}
          onConfirm={handleCharacterConfirm}
          onSkip={handleCharacterSkip}
        />
      )}

      {/* Step: Keywords */}
      {state.currentStep === 'keywords' && (
        <div className="space-y-4">
          <KeywordSelector
            selectedKeywords={state.selectedKeywords}
            onChange={setKeywords}
          />
          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" onClick={goBack} disabled={!canGoBack}>
              이전
            </Button>
            <Button onClick={handleKeywordsNext}>
              다음
            </Button>
          </div>
        </div>
      )}

      {/* Step: Intro edit */}
      {state.currentStep === 'intro-edit' && (
        <div className="space-y-4">
          <AutoIntroGenerator
            participantName={participantName}
            keywords={state.selectedKeywords}
            characterUrl={state.characterUrl}
            onSave={handleIntroSave}
          />
          <div className="flex items-center justify-start">
            <Button variant="ghost" onClick={goBack} disabled={!canGoBack}>
              이전
            </Button>
          </div>
        </div>
      )}

      {/* Step: Complete */}
      {state.currentStep === 'complete' && (
        <div className="text-center space-y-6 py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">완료!</h2>
            <p className="text-slate-500 mt-2">
              출석과 자기소개가 모두 완료되었습니다
            </p>
          </div>
          {state.characterUrl && (
            <div className="inline-block">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 mx-auto">
                <img
                  src={state.characterUrl}
                  alt="내 캐릭터"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
