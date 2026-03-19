import { Timestamp } from 'firebase/firestore';

export interface IntroCard {
  id: string;
  participantName: string;
  content: string;
  photoUrl: string | null;
  characterUrl?: string | null;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
