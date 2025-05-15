'use client';

import { useState, useEffect } from 'react'; // Added useEffect
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react'; // Import Loader2 and AlertTriangle
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Import Alert components

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, user, loading: authLoading, isFirebaseConfigured } = useAuth(); // Get loading state and config status from context
  const router = useRouter();
  const { toast } = useToast();
  const [showConfigError, setShowConfigError] = useState(false);

  useEffect(() => {
      // Show config error only after initial auth check is done
      if (!authLoading && !isFirebaseConfigured) {
          setShowConfigError(true);
      }
  }, [authLoading, isFirebaseConfigured]);


  // Redirect if already logged in and Firebase is configured
  useEffect(() => {
    if (!authLoading && user && isFirebaseConfigured) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, isFirebaseConfigured, router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFirebaseConfigured) {
        setError("Login is disabled because Firebase is not configured correctly. Please contact the administrator.");
        toast({ title: 'Configuration Error', description: 'Firebase not configured.', variant: 'destructive' });
        return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      toast({ title: 'Login Successful', description: 'Redirecting to dashboard...' });
      router.push('/dashboard'); // Redirect after successful login
    } catch (err: any) {
      console.error('Login error:', err);
      if (isFirebaseConfigured && (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password')) {
        console.log("[LOGIN_PAGE] Firebase is configured. The error 'auth/invalid-credential' (or similar) suggests the email/password is incorrect for this Firebase project, or the user account doesn't exist/is disabled.");
      }
      // Map Firebase error codes to user-friendly messages
        let errorMessage = 'Failed to login. Please check your credentials.';
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid email or password.';
        } else if (err.code === 'auth/invalid-email') {
             errorMessage = 'Invalid email format.';
        } else if (err.code === 'auth/too-many-requests') {
             errorMessage = 'Too many login attempts. Please try again later.';
        }
      setError(errorMessage);
      toast({ title: 'Login Failed', description: errorMessage, variant: 'destructive' });
      setLoading(false);
    }
    // No need to setLoading(false) on success because we redirect
  };

   // Render loading or null while checking auth state or redirecting
   if (authLoading || (user && isFirebaseConfigured)) {
       return <div className="flex h-screen items-center justify-center">Loading...</div>;
   }


  return (
    <div className="flex flex-1 min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-1">
          {/* Optional Logo */}
           <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 mx-auto text-primary"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <line x1="3" x2="21" y1="9" y2="9" />
              <line x1="9" x2="9" y1="21" y2="9" />
            </svg>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
           {showConfigError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Configuration Error</AlertTitle>
                <AlertDescription>
                  Login is currently unavailable due to a configuration issue. Please contact support.
                </AlertDescription>
              </Alert>
            )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || showConfigError} // Disable if loading or config error
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                 <Label htmlFor="password">Password</Label>
                 <Link href="/forgot-password" className={`text-sm text-primary hover:underline ${showConfigError ? 'pointer-events-none opacity-50' : ''}`}>
                    Forgot password?
                 </Link>
               </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || showConfigError} // Disable if loading or config error
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || showConfigError}>
               {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex flex-col items-center text-sm text-muted-foreground">
            <p>Don't have an account?</p>
            <Link href="/signup" className={`text-primary hover:underline font-medium ${showConfigError ? 'pointer-events-none opacity-50' : ''}`}>
                 Sign up here
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
