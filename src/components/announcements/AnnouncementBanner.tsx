'use client';
import type { Announcement } from '@/types/announcement';

interface AnnouncementBannerProps {
  announcement: Announcement;
  onDismiss?: () => void;
}

export default function AnnouncementBanner({ announcement, onDismiss }: AnnouncementBannerProps) {
  const isUrgent = announcement.priority === 'urgent';

  return (
    <div
      className={`px-4 py-3 rounded-xl flex items-center gap-3 ${
        isUrgent
          ? 'bg-red-50 border border-red-200 text-red-800'
          : 'bg-blue-50 border border-blue-200 text-blue-800'
      }`}
    >
      <span className="text-lg">{isUrgent ? '🚨' : '📢'}</span>
      <div className="flex-1">
        <p className="font-semibold text-sm">{announcement.title}</p>
        <p className="text-sm opacity-80">{announcement.content}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="opacity-50 hover:opacity-100 text-lg">&times;</button>
      )}
    </div>
  );
}
