import { Timestamp } from 'firebase/firestore';

export interface LunchMenuOption {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
}

export interface LunchPoll {
  id: string;
  title: string;
  options: LunchMenuOption[];
  isOpen: boolean;
  createdAt: Timestamp;
}

export interface LunchVote {
  id: string;
  optionId: string;
  participantName: string;
  votedAt: Timestamp;
  updatedAt: Timestamp;
}
