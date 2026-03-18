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
}
