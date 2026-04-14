import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { api, API_URL } from './api';

export interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: MockUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  login: () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setUser(null);
      setProfile(null);
      return;
    }

    const { data } = await api.get('/api/auth/me');
    const loadedProfile: UserProfile = {
      uid: data.uid,
      name: data.name,
      email: data.email,
      role: data.role,
      createdAt: data.createdAt,
    };

    const loadedUser: MockUser = {
      uid: data.uid,
      email: data.email,
      displayName: data.name,
    };

    setProfile(loadedProfile);
    setUser(loadedUser);
    localStorage.setItem('mockProfile', JSON.stringify(loadedProfile));
    localStorage.setItem('mockUser', JSON.stringify(loadedUser));
  };

  useEffect(() => {
    const init = async () => {
      try {
        await refreshProfile();
      } catch (error) {
        console.error(error);
        localStorage.removeItem('authToken');
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, []);

  const login = () => {
    window.location.href = `${API_URL}/oauth2/authorization/google`;
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('mockUser');
    localStorage.removeItem('mockProfile');
  };

  const isAdmin = profile?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
