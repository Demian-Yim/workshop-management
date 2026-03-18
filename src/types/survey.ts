import { Timestamp } from 'firebase/firestore';

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'rating' | 'text' | 'multipleChoice';
  options: string[] | null;
}

export interface SurveyTemplate {
  id: string;
  title: string;
  questions: SurveyQuestion[];
  createdBy: string;
  createdAt: Timestamp;
}

export interface SurveyResponseItem {
  questionId: string;
  rating: number | null;
  text: string | null;
}

export interface SurveyResponse {
  id: string;
  responses: SurveyResponseItem[];
  overallRating: number;
  submittedAt: Timestamp;
}
