import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';

// Mock User type to replace Firebase User
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
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem('mockUser');
    const storedProfile = localStorage.getItem('mockProfile');
    
    if (storedUser && storedProfile) {
      setUser(JSON.parse(storedUser));
      setProfile(JSON.parse(storedProfile));
    }
    setLoading(false);
  }, []);

  const login = (email: string) => {
    const isHardcodedAdmin = email === 'admin@test.com' || email === 'tony107107107@gmail.com';
    
    const mockUser: MockUser = {
      uid: isHardcodedAdmin ? 'admin-uid-123' : 'user-uid-456',
      email: email,
      displayName: isHardcodedAdmin ? 'Admin User' : 'Customer User',
    };
    
    const mockProfile: UserProfile = {
      uid: mockUser.uid,
      name: mockUser.displayName || 'Guest',
      email: mockUser.email || '',
      role: isHardcodedAdmin ? 'ADMIN' : 'CUSTOMER',
      createdAt: new Date().toISOString(),
    };

    setUser(mockUser);
    setProfile(mockProfile);
    
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    localStorage.setItem('mockProfile', JSON.stringify(mockProfile));
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('mockUser');
    localStorage.removeItem('mockProfile');
  };

  const isAdmin = profile?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
