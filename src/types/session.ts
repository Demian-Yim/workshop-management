import { Timestamp } from 'firebase/firestore';

export interface Course {
  id: string;
  title: string;
  description: string;
  startDate: Timestamp;
  endDate: Timestamp;
  facilitatorId: string;
  facilitatorName: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: Timestamp;
  createdBy: string;
}

export interface Session {
  id: string;
  courseId: string;
  date: Timestamp;
  dayNumber: number;
  sessionCode: string;
  title: string;
  status: 'waiting' | 'active' | 'closed';
  activeFeature: string | null;
  facilitatorId: string;
  settings: SessionSettings;
  createdAt: Timestamp;
}

export interface SessionSettings {
  attendanceOpen: boolean;
  boardOpen: boolean;
  lunchPollOpen: boolean;
  lunchOrderOpen: boolean;
  reviewOpen: boolean;
  surveyOpen: boolean;
  introOpen: boolean;
}

export interface Participant {
  id: string;
  name: string;
  joinedAt: Timestamp;
  sessionCode: string;
  teamId: string | null;
  isActive: boolean;
}

export interface SessionCode {
  courseId: string;
  sessionId: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}
