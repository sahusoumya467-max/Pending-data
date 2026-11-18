import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

let inMemoryIdToken: string | null = null;

export async function signInWithGooglePopup(): Promise<{
  user: User;
  idToken: string;
}> {
  const result = await signInWithPopup(auth, googleAuthProvider);
  const idToken = await result.user.getIdToken(true);
  inMemoryIdToken = idToken;
  return { user: result.user, idToken };
}

export async function signOutGoogle(): Promise<void> {
  inMemoryIdToken = null;
  await signOut(auth);
}

export async function getFreshIdToken(forceRefresh = false): Promise<string | null> {
  const current = auth.currentUser;
  if (!current) {
    inMemoryIdToken = null;
    return null;
  }
  const token = await current.getIdToken(forceRefresh);
  inMemoryIdToken = token;
  return token;
}

export function getCachedInMemoryToken(): string | null {
  return inMemoryIdToken;
}

export function subscribeAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        inMemoryIdToken = await user.getIdToken();
      } catch {
        inMemoryIdToken = null;
      }
    } else {
      inMemoryIdToken = null;
    }
    callback(user);
  });
}
