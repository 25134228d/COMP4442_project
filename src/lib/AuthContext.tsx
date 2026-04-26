import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { UserProfile } from '../types';

export interface ApiUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface LoginResponse {
  user: ApiUser;
  profile: UserProfile;
}

interface AuthContextType {
  user: ApiUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string) => Promise<ApiUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  login: async () => ({ uid: '', email: '', displayName: '' }),
  logout: () => { },
});

const AUTH_STORAGE_KEY = 'buffetease-auth-session';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedSession = localStorage.getItem(AUTH_STORAGE_KEY);
    if (cachedSession) {
      try {
        const parsed = JSON.parse(cachedSession) as { user: ApiUser; profile: UserProfile };
        setUser(parsed.user);
        setProfile(parsed.profile);
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    try {
      const response = await axios.post<LoginResponse>('/api/auth/login', { email });
      const { user, profile } = response.data;

      setUser(user);
      setProfile(profile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, profile }));
      return user;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const isAdmin = profile?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
