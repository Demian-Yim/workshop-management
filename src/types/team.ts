import { Timestamp } from 'firebase/firestore';

export interface Team {
  id: string;
  teamName: string;
  memberIds: string[];
  memberNames: string[];
  color: string;
  createdAt: Timestamp;
}
