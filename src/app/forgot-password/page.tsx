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


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { resetPassword, user, loading: authLoading, isFirebaseConfigured } = useAuth(); // Get loading and config status
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


  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!isFirebaseConfigured) {
        setError("Password reset is disabled because Firebase is not configured correctly. Please contact the administrator.");
        toast({ title: 'Configuration Error', description: 'Firebase not configured.', variant: 'destructive' });
        return;
    }


    setLoading(true);
    try {
      await resetPassword(email);
      setMessage('Password reset email sent. Please check your inbox.');
      toast({ title: 'Email Sent', description: 'Check your inbox for reset instructions.' });
       setLoading(false); // Keep form enabled after success message
    } catch (err: any) {
      console.error('Password reset error:', err);
       let errorMessage = 'Failed to send reset email. Please try again.';
       if (err.code === 'auth/invalid-email') {
           errorMessage = 'Invalid email format.';
       } else if (err.code === 'auth/user-not-found') {
           errorMessage = 'No user found with this email address.';
       }
      setError(errorMessage);
       toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      setLoading(false);
    }
  };

    // Render loading or null while checking auth state or redirecting
   if (authLoading || (user && isFirebaseConfigured)) {
     return <div className="flex h-screen items-center justify-center">Loading...</div>;
   }


  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
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
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your email to receive reset instructions.</CardDescription>
        </CardHeader>
        <CardContent>
            {showConfigError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Configuration Error</AlertTitle>
                <AlertDescription>
                  Password reset is currently unavailable due to a configuration issue. Please contact support.
                </AlertDescription>
              </Alert>
            )}
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || showConfigError}
              />
            </div>
            {message && <p className="text-sm text-green-600">{message}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || showConfigError}>
               {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Email'}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex justify-center text-sm">
            <Link href="/login" className={`text-primary hover:underline ${showConfigError ? 'pointer-events-none opacity-50' : ''}`}>
                 Back to Login
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
