'use client';

import { useState, useCallback } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { setDocument } from '@/lib/firebase/firestore';
import { uploadImage } from '@/lib/firebase/storage';
import { useSessionStore } from '@/hooks/useSession';
import type { CheckInFlowStep, CheckInFlowState } from '@/types/character';

const INITIAL_STATE: CheckInFlowState = {
  currentStep: 'checkin',
  checkedIn: false,
  selfieUrl: null,
  characterUrl: null,
  selectedKeywords: [],
  introContent: '',
};

const STEP_ORDER: CheckInFlowStep[] = [
  'checkin',
  'selfie',
  'generating',
  'character',
  'keywords',
  'intro-edit',
  'complete',
];

interface UseCheckInFlowReturn {
  state: CheckInFlowState;
  goToStep: (step: CheckInFlowStep) => void;
  completeCheckIn: () => Promise<void>;
  saveSelfie: (dataUrl: string) => Promise<string>;
  saveCharacter: (base64: string) => Promise<string>;
  setKeywords: (keywords: string[]) => void;
  setIntroContent: (content: string) => void;
  saveIntro: (content?: string) => Promise<void>;
  skipStep: () => void;
  canGoBack: boolean;
  goBack: () => void;
}

export function useCheckInFlow(): UseCheckInFlowReturn {
  const { courseId, sessionId, participantId, participantName } = useSessionStore();
  const [state, setState] = useState<CheckInFlowState>(INITIAL_STATE);

  const basePath =
    courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '';

  const goToStep = useCallback((step: CheckInFlowStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const completeCheckIn = useCallback(async () => {
    if (!basePath || !participantId) return;

    await setDocument(`${basePath}/attendance/${participantId}`, {
      participantName,
      checkedInAt: serverTimestamp(),
      method: 'photo',
    });

    setState((prev) => ({
      ...prev,
      checkedIn: true,
      currentStep: 'selfie',
    }));
  }, [basePath, participantId, participantName]);

  const saveSelfie = useCallback(
    async (dataUrl: string): Promise<string> => {
      if (!basePath || !participantId) throw new Error('세션 정보가 없습니다');

      // Convert data URL to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const storagePath = `sessions/${sessionId}/selfies/${participantId}.jpg`;
      const selfieUrl = await uploadImage(storagePath, blob);

      // Update attendance record with selfie URL
      await setDocument(`${basePath}/attendance/${participantId}`, {
        selfieUrl,
      });

      setState((prev) => ({
        ...prev,
        selfieUrl,
        currentStep: 'generating',
      }));

      return selfieUrl;
    },
    [basePath, sessionId, participantId]
  );

  const saveCharacter = useCallback(
    async (base64: string): Promise<string> => {
      if (!basePath || !participantId) throw new Error('세션 정보가 없습니다');

      // Convert base64 to Blob
      const byteString = atob(base64);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([uint8Array], { type: 'image/png' });

      const storagePath = `sessions/${sessionId}/characters/${participantId}.png`;
      const characterUrl = await uploadImage(storagePath, blob);

      // Update attendance record with character URL
      await setDocument(`${basePath}/attendance/${participantId}`, {
        characterUrl,
      });

      setState((prev) => ({
        ...prev,
        characterUrl,
        currentStep: 'character',
      }));

      return characterUrl;
    },
    [basePath, sessionId, participantId]
  );

  const setKeywords = useCallback((keywords: string[]) => {
    setState((prev) => ({ ...prev, selectedKeywords: keywords }));
  }, []);

  const setIntroContent = useCallback((content: string) => {
    setState((prev) => ({ ...prev, introContent: content }));
  }, []);

  const saveIntro = useCallback(async (content?: string) => {
    if (!basePath || !participantId) return;

    const introContent = content ?? state.introContent;

    await setDocument(`${basePath}/introCards/${participantId}`, {
      participantName,
      content: introContent,
      photoUrl: state.selfieUrl,
      characterUrl: state.characterUrl,
      tags: state.selectedKeywords,
      createdAt: serverTimestamp(),
    });

    setState((prev) => ({ ...prev, introContent, currentStep: 'complete' }));
  }, [basePath, participantId, participantName, state.introContent, state.selfieUrl, state.characterUrl, state.selectedKeywords]);

  const skipStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.currentStep);
      const nextStep = STEP_ORDER[currentIndex + 1] || 'complete';
      // Skip 'generating' when skipping from selfie
      const effectiveNext =
        nextStep === 'generating' ? 'keywords' : nextStep;
      return { ...prev, currentStep: effectiveNext };
    });
  }, []);

  const currentIndex = STEP_ORDER.indexOf(state.currentStep);
  const canGoBack = currentIndex > 0 && state.currentStep !== 'generating' && state.currentStep !== 'complete';

  const goBack = useCallback(() => {
    setState((prev) => {
      const idx = STEP_ORDER.indexOf(prev.currentStep);
      if (idx <= 0) return prev;
      let prevStep = STEP_ORDER[idx - 1];
      // Skip 'generating' step when going back
      if (prevStep === 'generating') prevStep = STEP_ORDER[idx - 2] || 'checkin';
      return { ...prev, currentStep: prevStep };
    });
  }, []);

  return {
    state,
    goToStep,
    completeCheckIn,
    saveSelfie,
    saveCharacter,
    setKeywords,
    setIntroContent,
    saveIntro,
    skipStep,
    canGoBack,
    goBack,
  };
}
