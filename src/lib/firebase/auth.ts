import {
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

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
  return signInWithRedirect(auth, googleProvider);
}

export async function handleGoogleRedirectResult() {
  const credential = await getRedirectResult(auth);
  if (credential) {
    const token = await credential.user.getIdToken();
    setAuthCookie(token);
    await ensureUserRegistered(credential.user);
  }
  return credential;
}

/**
 * On first Google sign-in, register user into pendingUsers unless already
 * an admin or already approved in users/{uid}.
 */
export async function ensureUserRegistered(user: User) {
  const adminRef = doc(db, 'admins', user.uid);
  const adminSnap = await getDoc(adminRef);
  if (adminSnap.exists()) return; // already an admin, no action needed

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) return; // already registered/approved

  const pendingRef = doc(db, 'pendingUsers', user.uid);
  const pendingSnap = await getDoc(pendingRef);
  if (!pendingSnap.exists()) {
    await setDoc(pendingRef, {
      uid: user.uid,
      displayName: user.displayName ?? '',
      email: user.email ?? '',
      photoURL: user.photoURL ?? '',
      requestedAt: serverTimestamp(),
      status: 'pending',
    });
  }
}

/** Check admin status in Firestore */
export async function checkIsAdmin(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists();
}

/** Check approved user status */
export async function checkIsApproved(uid: string): Promise<'admin' | 'approved' | 'pending' | 'none'> {
  const adminSnap = await getDoc(doc(db, 'admins', uid));
  if (adminSnap.exists()) return 'admin';

  const userSnap = await getDoc(doc(db, 'users', uid));
  if (userSnap.exists()) {
    const data = userSnap.data();
    return data.approved ? 'approved' : 'pending';
  }

  const pendingSnap = await getDoc(doc(db, 'pendingUsers', uid));
  if (pendingSnap.exists()) return 'pending';

  return 'none';
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
