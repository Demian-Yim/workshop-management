import { Timestamp } from 'firebase/firestore';

export interface CourseReview {
  id: string;
  participantName: string;
  content: string;
  rating: number;
  isAnonymous: boolean;
  createdAt: Timestamp;
}
