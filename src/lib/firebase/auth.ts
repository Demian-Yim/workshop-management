import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

/** Set a session marker cookie readable by middleware (not HttpOnly). */
function setAuthCookie(token: string) {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24; // 24 hours
  document.cookie = `auth-token=${token}; Path=/; max-age=${maxAge}; SameSite=Strict; Secure`;
}

/** Clear the session marker cookie on sign-out. */
function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'auth-token=; Path=/; max-age=0; SameSite=Strict; Secure';
}

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const token = await credential.user.getIdToken();
  setAuthCookie(token);
  return credential;
}

export async function signInWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  const token = await credential.user.getIdToken();
  setAuthCookie(token);
  return credential;
}

export async function signOut() {
  clearAuthCookie();
  return firebaseSignOut(auth);
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Refresh cookie on auth state restoration (e.g., page reload)
      try {
        const token = await user.getIdToken();
        setAuthCookie(token);
      } catch {
        // Non-fatal: middleware redirect will still happen on next navigation
      }
    } else {
      clearAuthCookie();
    }
    callback(user);
  });
}
