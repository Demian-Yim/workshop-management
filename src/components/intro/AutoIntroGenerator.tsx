'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/button';

interface AutoIntroGeneratorProps {
  participantName: string;
  keywords: string[];
  characterUrl: string | null;
  initialContent?: string;
  onSave: (content: string) => void;
  saving?: boolean;
  className?: string;
}

function generateIntroFromKeywords(name: string, keywords: string[]): string {
  if (keywords.length === 0) {
    return `안녕하세요, ${name}입니다. 반갑습니다!`;
  }

  const personality = keywords.filter((k) =>
    ['외향적', '내향적', '꼼꼼한', '창의적', '리더십', '협력적', '낙관적', '분석적', '도전적', '차분한'].includes(k)
  );
  const interests = keywords.filter((k) =>
    ['테크', '디자인', '마케팅', '데이터', 'AI', '스타트업', '교육', '헬스케어', '금융', '콘텐츠'].includes(k)
  );
  const roles = keywords.filter((k) =>
    ['기획자', '개발자', '디자이너', 'PM', '마케터', '데이터분석가', '리서처', '운영자', '컨설턴트', '교육자'].includes(k)
  );
  const hobbies = keywords.filter((k) =>
    ['운동', '독서', '여행', '게임', '음악', '요리', '사진', '영화', '등산', '명상'].includes(k)
  );

  const parts: string[] = [`안녕하세요, ${name}입니다.`];

  if (roles.length > 0) {
    parts.push(`현재 ${roles.join(', ')}로 활동하고 있습니다.`);
  }

  if (personality.length > 0) {
    parts.push(`${personality.join(', ')} 성격의 소유자입니다.`);
  }

  if (interests.length > 0) {
    parts.push(`${interests.join(', ')} 분야에 관심이 많습니다.`);
  }

  if (hobbies.length > 0) {
    parts.push(`취미는 ${hobbies.join(', ')}입니다.`);
  }

  parts.push('이번 워크샵에서 많은 것을 배우고 싶습니다. 잘 부탁드립니다!');

  return parts.join(' ');
}

export default function AutoIntroGenerator({
  participantName,
  keywords,
  characterUrl,
  initialContent,
  onSave,
  saving,
  className,
}: AutoIntroGeneratorProps) {
  const [content, setContent] = useState(
    initialContent || generateIntroFromKeywords(participantName, keywords)
  );
  const [isEditing, setIsEditing] = useState(false);

  const handleRegenerate = useCallback(() => {
    setContent(generateIntroFromKeywords(participantName, keywords));
  }, [participantName, keywords]);

  const handleSave = () => {
    onSave(content);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-900">자기소개</h3>
        <p className="text-sm text-slate-500 mt-1">
          키워드 기반으로 자동 생성된 자기소개를 수정할 수 있습니다
        </p>
      </div>

      {/* Character + Intro preview */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-5 space-y-4">
        <div className="flex items-start gap-4">
          {characterUrl && (
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
              <Image src={characterUrl} alt="캐릭터" width={64} height={64} className="w-full h-full object-cover" unoptimized />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900">{participantName}</p>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none"
            placeholder="자기소개를 작성해주세요..."
          />
        ) : (
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '미리보기' : '직접 수정'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerate}
          >
            다시 생성
          </Button>
        </div>
        <Button onClick={handleSave} loading={saving}>
          저장하기
        </Button>
      </div>
    </div>
  );
}
