'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import Avatar from '@/components/ui/avatar';
import { useComments } from '@/hooks/useComments';
import { useSessionStore } from '@/hooks/useSession';
import { formatDateTime } from '@/lib/utils';

interface CommentPanelProps {
  postId: string | null;
  onClose: () => void;
}

export default function CommentPanel({ postId, onClose }: CommentPanelProps) {
  const { participantId, participantName } = useSessionStore();
  const { comments, loading, addComment, submitting } = useComments(postId);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !participantId) return;
    await addComment(text.trim(), participantId, participantName || '익명');
    setText('');
  };

  if (!postId) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[70vh] animate-slide-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">댓글</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors rounded-md"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {loading ? (
            <div className="text-center py-6 text-slate-400 text-sm">로딩 중...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">첫 번째 댓글을 남겨보세요</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5">
                <Avatar name={comment.authorName} size="sm" />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-slate-800">{comment.authorName}</span>
                    {comment.createdAt && (
                      <span className="text-xs text-slate-400">{formatDateTime(comment.createdAt)}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-slate-100 flex gap-2 items-end">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent); }
            }}
            placeholder="댓글 입력..."
            rows={1}
            maxLength={500}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-400 focus:outline-none text-sm resize-none bg-slate-50"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-xl transition-colors shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );
}
