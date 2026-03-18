import { Timestamp } from 'firebase/firestore';

export interface Announcement {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  priority: 'normal' | 'urgent';
  isActive: boolean;
  createdAt: Timestamp;
}
