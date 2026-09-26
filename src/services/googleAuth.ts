/**
 * Google Authentication and Firebase initialization for Workspace Calendar integration.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import rawFirebaseConfig from '../../firebase-applet-config.json';

// Support both local firebase-applet-config.json and Vercel environment variables
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || rawFirebaseConfig.apiKey,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || rawFirebaseConfig.authDomain,
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || rawFirebaseConfig.projectId,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || rawFirebaseConfig.storageBucket,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || rawFirebaseConfig.messagingSenderId,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || rawFirebaseConfig.appId,
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with dual IndexedDB + LocalStorage fallback for 100% persistent sessions
export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    });
  } catch {
    return getAuth(app);
  }
})();

export const db = getFirestore(app);

// Provider with required Google Calendar scopes
export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
];

const provider = new GoogleAuthProvider();
CALENDAR_SCOPES.forEach((scope) => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'select_account',
});

export interface CachedUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

const USER_STORAGE_KEY = 'pes_user_profile';
const TOKEN_STORAGE_KEY = 'pes_google_access_token';

export const getStoredUser = (): CachedUserProfile | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const saveStoredUser = (user: User | CachedUserProfile) => {
  try {
    const profile: CachedUserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile:', e);
  }
};

export const clearStoredUser = () => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear stored user:', e);
  }
};

// Flag to track sign-in in progress
let isSigningIn = false;
let cachedAccessToken: string | null = getStoredToken();

export const initAuth = (
  onAuthSuccess?: (user: User | CachedUserProfile, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  // If we already have stored credentials in localStorage, immediately notify listeners so there is ZERO delay or logout flash on refresh
  const storedUser = getStoredUser();
  const storedToken = getStoredToken();
  if (storedUser && onAuthSuccess) {
    onAuthSuccess(storedUser, storedToken);
  }

  return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    if (firebaseUser) {
      saveStoredUser(firebaseUser);
      cachedAccessToken = getStoredToken();
      if (onAuthSuccess) onAuthSuccess(firebaseUser, cachedAccessToken);
    } else {
      // If Firebase Auth is still initializing in the background, check if user is stored in localStorage
      const activeStoredUser = getStoredUser();
      if (activeStoredUser) {
        // Keep user active from local storage! Do NOT log them out!
        if (onAuthSuccess) onAuthSuccess(activeStoredUser, getStoredToken());
      } else {
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google sign-in.');
    }

    cachedAccessToken = credential.accessToken;
    saveStoredUser(result.user);
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, credential.accessToken);
      sessionStorage.setItem(TOKEN_STORAGE_KEY, credential.accessToken);
    } catch {}

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  if (!cachedAccessToken) {
    cachedAccessToken = getStoredToken();
  }
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {}
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error('Error during Firebase signOut:', e);
  }
  cachedAccessToken = null;
  clearStoredUser();
};
