'use client';
import { useState } from 'react';
import Button from '@/components/ui/button';
import { setDocument, serverTimestamp } from '@/lib/firebase/firestore';

interface CheckInButtonProps {
  courseId: string;
  sessionId: string;
  participantId: string;
  participantName: string;
  isCheckedIn: boolean;
  onCheckIn?: () => void;
}

export default function CheckInButton({
  courseId,
  sessionId,
  participantId,
  participantName,
  isCheckedIn,
  onCheckIn,
}: CheckInButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    if (isCheckedIn) return;
    setLoading(true);
    try {
      await setDocument(
        `courses/${courseId}/sessions/${sessionId}/attendance/${participantId}`,
        {
          participantId,
          participantName,
          checkedInAt: serverTimestamp(),
          method: 'button',
          status: 'present',
        }
      );
      onCheckIn?.();
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isCheckedIn) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-emerald-600 font-semibold">출석 완료!</p>
      </div>
    );
  }

  return (
    <Button onClick={handleCheckIn} loading={loading} size="lg" className="w-full">
      출석 체크
    </Button>
  );
}
