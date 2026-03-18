'use client';
import { useState } from 'react';
import Button from '@/components/ui/button';

interface PostFormProps {
  onSubmit: (data: { content: string; imageUrl?: string }) => Promise<void>;
}

export default function PostForm({ onSubmit }: PostFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ content: content.trim() });
      setContent('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="생각을 공유해주세요..."
        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
        rows={3}
        maxLength={1000}
      />
      <div className="flex justify-end mt-2">
        <Button type="submit" loading={loading} size="sm" disabled={!content.trim()}>
          게시
        </Button>
      </div>
    </form>
  );
}
