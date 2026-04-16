import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function AuthPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      await login(email);
      toast.success('Welcome to BuffetEase!');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 mx-auto">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-brand-olive w-12 h-12 rounded-full flex items-center justify-center">
            <Utensils className="text-white h-6 w-6" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl serif">Welcome Back</CardTitle>
            <CardDescription className="text-slate-500">
              Sign in to manage your reservations and explore our exquisite buffet packages.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@test.com or user@test.com"
                className="w-full h-12 px-4 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-olive"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-brand-olive hover:bg-brand-olive/90 text-white transition-all"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="text-sm text-center text-slate-500 mt-4">
            <p><strong>Admin:</strong> admin@test.com</p>
            <p><strong>Customer:</strong> user@test.com</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center">
          <p className="text-xs text-slate-400">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
