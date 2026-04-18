import { Timestamp } from 'firebase/firestore';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  teamId: string | null;
  content: string;
  imageUrl: string | null;
  category: string | null;
  likeCount: number;
  likedBy: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Phase 1 additions — Padlet-grade
  sectionId: string | null;
  color: string | null;
  pinned: boolean;
  commentCount: number;
  attachments: Attachment[];
}

export interface BoardSection {
  id: string;
  title: string;
  color: string | null;
  teamId: string | null;
  orderIndex: number;
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Timestamp;
}

export interface Attachment {
  type: 'image' | 'pdf' | 'link';
  url: string;
  name: string;
}

export const POST_COLORS = [
  '#fef08a', // yellow
  '#fda4af', // pink
  '#93c5fd', // blue
  '#86efac', // green
  '#d8b4fe', // purple
  '#fdba74', // orange
  '#ffffff',  // white
] as const;

export type PostColor = (typeof POST_COLORS)[number];
