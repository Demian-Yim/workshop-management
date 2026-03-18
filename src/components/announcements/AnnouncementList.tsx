'use client';
import AnnouncementBanner from './AnnouncementBanner';
import type { Announcement } from '@/types/announcement';

interface AnnouncementListProps {
  announcements: Announcement[];
}

export default function AnnouncementList({ announcements }: AnnouncementListProps) {
  if (announcements.length === 0) {
    return <div className="text-center py-8 text-slate-500">공지사항이 없습니다</div>;
  }

  return (
    <div className="space-y-3">
      {announcements.map((ann) => (
        <AnnouncementBanner key={ann.id} announcement={ann} />
      ))}
    </div>
  );
}
