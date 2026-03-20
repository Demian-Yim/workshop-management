'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useCamera } from '@/hooks/useCamera';
import Button from '@/components/ui/button';

interface SelfieCaptureProps {
  onCapture: (dataUrl: string) => void;
  onSkip?: () => void;
  className?: string;
}

export default function SelfieCapture({ onCapture, onSkip, className }: SelfieCaptureProps) {
  const { videoRef, canvasRef, isStreaming, error, startCamera, stopCamera, capturePhoto } = useCamera();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    const dataUrl = capturePhoto();
    if (dataUrl) {
      setPreview(dataUrl);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setPreview(null);
    startCamera();
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setUploading(true);
    setConfirmError(null);
    try {
      await onCapture(preview);
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : '사진 처리 중 오류가 발생했습니다');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-900">셀카 촬영</h3>
        <p className="text-sm text-slate-500 mt-1">
          출석 확인과 캐릭터 생성에 사용됩니다
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <Button variant="secondary" size="sm" onClick={startCamera} className="mt-2">
            다시 시도
          </Button>
        </div>
      )}

      <div className="relative mx-auto w-64 h-64 rounded-xl overflow-hidden bg-slate-100">
        {preview ? (
          <img src={preview} alt="셀카 미리보기" className="w-full h-full object-cover" />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                'w-full h-full object-cover scale-x-[-1]',
                !isStreaming && 'hidden'
              )}
            />
            {!isStreaming && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse text-slate-400 text-sm">카메라 로딩 중...</div>
              </div>
            )}
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {confirmError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-sm text-red-600">{confirmError}</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        {preview ? (
          <>
            <Button variant="secondary" onClick={handleRetake} disabled={uploading}>
              다시 찍기
            </Button>
            <Button onClick={handleConfirm} loading={uploading}>
              이 사진 사용
            </Button>
          </>
        ) : (
          <>
            {onSkip && (
              <Button variant="ghost" onClick={onSkip}>
                건너뛰기
              </Button>
            )}
            <Button
              onClick={handleCapture}
              disabled={!isStreaming}
              size="lg"
              className="rounded-full w-16 h-16 !p-0"
            >
              <div className="w-12 h-12 rounded-full border-4 border-white" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
