'use client';
import { useState } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';

interface AnnouncementFormProps {
  onSubmit: (data: { title: string; content: string; priority: 'normal' | 'urgent' }) => Promise<void>;
}

export default function AnnouncementForm({ onSubmit }: AnnouncementFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), content: content.trim(), priority });
      setTitle('');
      setContent('');
      setPriority('normal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="공지 제목"
        maxLength={100}
      />
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="공지 내용을 작성하세요..."
          maxLength={1000}
          className="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="radio"
            checked={priority === 'normal'}
            onChange={() => setPriority('normal')}
            className="accent-blue-500"
          />
          일반
        </label>
        <label className="flex items-center gap-2 text-sm text-red-400">
          <input
            type="radio"
            checked={priority === 'urgent'}
            onChange={() => setPriority('urgent')}
            className="accent-red-500"
          />
          긴급
        </label>
      </div>
      <Button type="submit" loading={loading} className="w-full">공지 발송</Button>
    </form>
  );
}
