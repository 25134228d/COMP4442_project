import { UserProfile } from '../types';

export interface ApiUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface StoredSession {
  user: ApiUser;
  profile: UserProfile;
}

const AUTH_STORAGE_KEY = 'buffetease-auth-session';

export function saveAuthSession(session: StoredSession) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function readAuthSession(): StoredSession | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
