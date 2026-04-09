'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useSessionStore } from '@/hooks/useSession';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import { useRealtimeDocument } from '@/hooks/useRealtimeDocument';
import Avatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/skeleton';
import type { IntroCard } from '@/types/intro';
import { toast } from '@/components/ui/toast';
import FeatureClosed from '@/components/ui/feature-closed';

export default function IntroPage() {
  const { courseId, sessionId, participantId, participantName, sessionData } = useSessionStore();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '';

  const { data: myIntro, loading: myIntroLoading } = useRealtimeDocument<IntroCard>(
    basePath && participantId ? `${basePath}/introCards/${participantId}` : '',
    !!(basePath && participantId)
  );

  const { data: allIntros, loading: allIntrosLoading } = useRealtimeCollection<IntroCard>(
    basePath ? `${basePath}/introCards` : '', [], !!basePath
  );

  // Initialize form fields from existing intro data (intentional one-time init from async Firestore data)
  useEffect(() => {
    if (myIntro) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: lazy init from Firestore data
      setContent((prev) => prev || myIntro.content || '');
      setTags((prev) => prev || myIntro.tags?.join(', ') || '');
    }
  }, [myIntro]);

  const handleSave = async () => {
    if (!basePath || !participantId || !content.trim()) return;
    setSaving(true);
    setSaved(false);
    try {
      await setDoc(doc(db, `${basePath}/introCards`, participantId), {
        participantName,
        content: content.trim(),
        photoUrl: myIntro?.photoUrl || null,
        characterUrl: myIntro?.characterUrl || null,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        createdAt: myIntro?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
      toast.error('저장에 실패했습니다');
    }
    setSaving(false);
  };

  if (sessionData && sessionData.settings?.introOpen === false) {
    return <FeatureClosed message="강사가 자기소개를 아직 열지 않았습니다" />;
  }

  if (myIntroLoading) {
    return <SkeletonList count={2} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">자기소개</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">소개글</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="안녕하세요! 저는..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">태그 (쉼표로 구분)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="개발자, 서울, 커피좋아"
              maxLength={200}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
          </div>
          {saved && (
            <div className="text-center text-sm text-green-600 font-medium animate-fade-in">
              저장되었습니다
            </div>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            loading={saving}
            size="lg"
            className="w-full"
          >
            {myIntro ? '수정하기' : '등록하기'}
          </Button>
        </div>
      </div>

      {allIntrosLoading ? (
        <SkeletonList count={3} />
      ) : allIntros.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-slate-500 mb-3">참가자 소개 ({allIntros.length}명)</h3>
          <div className="space-y-3">
            {allIntros.map((intro) => (
              <div key={intro.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  {intro.characterUrl ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                      <Image src={intro.characterUrl} alt={`${intro.participantName}의 캐릭터`} width={32} height={32} className="w-full h-full object-cover" unoptimized />
                    </div>
                  ) : (
                    <Avatar name={intro.participantName} size="sm" />
                  )}
                  <span className="font-semibold text-sm text-slate-900">{intro.participantName}</span>
                  {intro.id === participantId && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">나</span>
                  )}
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{intro.content}</p>
                {intro.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {intro.tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
