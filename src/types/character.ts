export type CheckInFlowStep =
  | 'checkin'
  | 'selfie'
  | 'generating'
  | 'character'
  | 'keywords'
  | 'intro-edit'
  | 'complete';

export interface CheckInFlowState {
  currentStep: CheckInFlowStep;
  checkedIn: boolean;
  selfieUrl: string | null;
  characterUrl: string | null;
  selectedKeywords: string[];
  introContent: string;
}

export interface CharacterGenerationRequest {
  imageBase64: string;
  style: 'cartoon' | 'anime' | 'pixel';
}

export interface CharacterGenerationResponse {
  success: boolean;
  characterImageUrl: string | null;
  error: string | null;
}

export const KEYWORD_CATEGORIES = {
  personality: {
    label: '성격',
    keywords: ['외향적', '내향적', '꼼꼼한', '창의적', '리더십', '협력적', '낙관적', '분석적', '도전적', '차분한'],
  },
  interest: {
    label: '관심사',
    keywords: ['테크', '디자인', '마케팅', '데이터', 'AI', '스타트업', '교육', '헬스케어', '금융', '콘텐츠'],
  },
  role: {
    label: '역할',
    keywords: ['기획자', '개발자', '디자이너', 'PM', '마케터', '데이터분석가', '리서처', '운영자', '컨설턴트', '교육자'],
  },
  hobby: {
    label: '취미',
    keywords: ['운동', '독서', '여행', '게임', '음악', '요리', '사진', '영화', '등산', '명상'],
  },
} as const;

export type KeywordCategory = keyof typeof KEYWORD_CATEGORIES;
