import React, { useState, useEffect, useRef } from 'react';
import { 
  signInWithRedirect, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  getRedirectResult 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const redirectCheckDone = useRef(false);

  // Check for redirect results when the page loads
  useEffect(() => {
    if (redirectCheckDone.current) return;
    redirectCheckDone.current = true;

    const checkRedirectLogin = async () => {
      try {
        console.log('=== [Google Auth] Redirect Check Started ===');
        console.log('[Google Auth] Current URL:', window.location.href);
        console.log('[Google Auth] Checking for redirect result...');
        const result = await getRedirectResult(auth);
        console.log('[Google Auth] Redirect result:', result);
        
        if (result && result.user) {
           console.log('[Google Auth] ✅ User logged in successfully:', result.user.email);
           console.log('[Google Auth] UID:', result.user.uid);
           toast.success('Welcome to BuffetEase!');
           // Give Firebase time to update state
           setTimeout(() => {
             console.log('[Google Auth] Navigating to home page...');
             navigate('/');
           }, 1000);
        } else {
          console.log('[Google Auth] ⚠️  No redirect result found');
          console.log('[Google Auth] Possible issues:');
          console.log('  1. Firebase redirected URI not configured');
          console.log('  2. Current URL does not match Firebase configuration');
          console.log('  3. Browser cache issue - try hard refresh (Ctrl+Shift+R)');
        }
      } catch (error: any) {
        console.error('[Google Auth] ❌ Error during redirect check:', error);
        console.error('[Google Auth] Error code:', error.code);
        console.error('[Google Auth] Error message:', error.message);
        // Only show error if it's not "canceled by user"
        if (error.code !== 'auth/popup-closed-by-user' && 
            error.code !== 'auth/cancelled-popup-request') {
          toast.error(error.message || 'Failed to sign in with Google.');
        }
      }
      console.log('=== [Google Auth] Redirect Check Finished ===');
    };

    checkRedirectLogin();
  }, [navigate]);

  // Handle Google OAuth Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      console.log('[Google Auth] Starting Google sign-in redirect...');
      const provider = new GoogleAuthProvider();
      // Set the display name for the popup
      provider.setCustomParameters({
        'prompt': 'select_account'
      });
      // This will navigate away from the page
      await signInWithRedirect(auth, provider);
      console.log('[Google Auth] Redirect initiated');
    } catch (error: any) {
      console.error('[Google Auth] Error:', error);
      // Re-enable button on error
      setLoading(false);
      // Don't show error if user cancelled
      if (error.code !== 'auth/popup-closed-by-user' && 
          error.code !== 'auth/cancelled-popup-request') {
        toast.error(error.message || 'Failed to start Google sign in.');
      }
    }
  };

  // Handle Email/Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to log in. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email/Password Sign Up
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Account created successfully! Welcome to BuffetEase!');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-brand-olive w-12 h-12 rounded-full flex items-center justify-center">
            <Utensils className="text-white h-6 w-6" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl serif">BuffetEase</CardTitle>
            <CardDescription className="text-slate-500">
              Sign in or create an account to manage your reservations.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Tabs for switching between Login and Sign Up */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-10" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            
            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-10" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Divider for Third-Party Logins */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            type="button"
            className="w-full h-12 text-base font-medium border-slate-200 hover:bg-slate-50 transition-all"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-3" />
            {loading ? 'Please wait...' : 'Google'}
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