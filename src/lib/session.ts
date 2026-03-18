import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import type { SessionCode } from '@/types/session';

export function generateSessionCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function validateSessionCode(
  code: string
): Promise<{ courseId: string; sessionId: string } | null> {
  const codeDoc = doc(db, 'sessionCodes', code);
  const snap = await getDoc(codeDoc);
  if (!snap.exists()) return null;
  const data = snap.data() as SessionCode;
  return { courseId: data.courseId, sessionId: data.sessionId };
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
