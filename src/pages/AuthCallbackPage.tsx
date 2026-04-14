import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../lib/AuthContext';

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  useEffect(() => {
    const completeAuth = async () => {
      const token = searchParams.get('token');
      if (!token) {
        toast.error('Login failed: token missing');
        navigate('/auth');
        return;
      }

      localStorage.setItem('authToken', token);
      try {
        await refreshProfile();
        toast.success('Welcome to BuffetEase!');
        navigate('/');
      } catch {
        localStorage.removeItem('authToken');
        toast.error('Login failed. Please try again.');
        navigate('/auth');
      }
    };
    void completeAuth();
  }, [navigate, refreshProfile, searchParams]);

  return <div className="container py-20 text-center">Completing sign-in...</div>;
}
