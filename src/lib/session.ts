import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import type { SessionCode } from '@/types/session';

const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 6;

/** 6자리 영숫자 세션코드 생성 */
export function generateSessionCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

/** sessionCodes/{code} 문서를 조회하여 세션 매핑 + 역할 반환 */
export async function validateSessionCode(
  code: string
): Promise<{ courseId: string; sessionId: string; role: 'learner' | 'facilitator' } | null> {
  const normalized = code.trim().toUpperCase();
  if (normalized.length !== CODE_LENGTH) return null;

  const codeDoc = doc(db, 'sessionCodes', normalized);
  const snap = await getDoc(codeDoc);
  if (!snap.exists()) return null;

  const data = snap.data() as SessionCode;
  return {
    courseId: data.courseId,
    sessionId: data.sessionId,
    role: data.role,
  };
}

const SESSION_STORAGE_KEY = 'workshop_session';

export interface StoredSession {
  courseId: string;
  sessionId: string;
  participantId: string;
  participantName: string;
  sessionCode: string;
}

export function saveSessionToStorage(session: StoredSession) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }
}

export function getSessionFromStorage(): StoredSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSessionStorage() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}
