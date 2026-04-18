import { Timestamp } from 'firebase/firestore';

export type ActivityType = 'poll' | 'qa' | 'wordcloud' | 'quiz' | 'timer';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  prompt: string | null;
  isActive: boolean;
  orderIndex: number;
  options?: PollOption[];
  duration?: number;
  createdAt: Timestamp;
}

export interface PollOption {
  id: string;
  text: string;
  imageUrl?: string | null;
  voteCount: number;
}

export interface PollVote {
  id: string;
  activityId: string;
  participantId: string;
  optionId: string;
  createdAt: Timestamp;
}

export interface QAQuestion {
  id: string;
  activityId: string;
  authorId: string;
  authorName: string;
  content: string;
  upvoteCount: number;
  upvotedBy: string[];
  answered: boolean;
  createdAt: Timestamp;
}

export interface WordEntry {
  id: string;
  activityId: string;
  word: string;
  authorId: string;
  createdAt: Timestamp;
}

export interface WordFrequency {
  word: string;
  count: number;
}
