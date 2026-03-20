'use client';
import { useState } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';

interface IntroCardFormProps {
  onSubmit: (data: { content: string; tags: string[] }) => Promise<void>;
  isSubmitted?: boolean;
}

export default function IntroCardForm({ onSubmit, isSubmitted }: IntroCardFormProps) {
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ content: content.trim(), tags });
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-6">
        <div className="text-3xl mb-2">✨</div>
        <p className="text-slate-600">자기소개를 작성했습니다!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">자기소개</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="간단한 자기소개를 작성해주세요..."
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
          maxLength={500}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">태그 (최대 5개)</label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="태그 입력 후 추가"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          />
          <Button type="button" variant="secondary" onClick={addTag}>추가</Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                #{t}
                <button type="button" onClick={() => removeTag(t)} className="hover:text-red-500">&times;</button>
              </span>
            ))}
          </div>
        )}
      </div>
      <Button type="submit" loading={loading} className="w-full">자기소개 등록</Button>
    </form>
  );
}
