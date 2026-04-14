import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Utensils } from 'lucide-react';

export function AuthPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = () => {
    setLoading(true);
    login();
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
              Sign in with Google to manage your reservations and explore our buffet packages.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            className="w-full h-12 text-base font-medium bg-brand-olive hover:bg-brand-olive/90 text-white transition-all"
            disabled={loading}
            onClick={handleLogin}
          >
            {loading ? 'Redirecting...' : 'Sign In with Google'}
          </Button>
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
