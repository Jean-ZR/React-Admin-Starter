
'use client';

import { useState, useEffect } from 'react'; // Added useEffect
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react'; // Import Loader2 and AlertTriangle
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Import Alert components


export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(''); // State for selected role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signup, user, loading: authLoading, isFirebaseConfigured } = useAuth(); // Get loading and config status
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

  // Basic password strength check (example)
  const isPasswordStrong = (pw: string): boolean => {
    return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw);
  };


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

     if (!isFirebaseConfigured) {
        setError("Signup is disabled because Firebase is not configured correctly. Please contact the administrator.");
        toast({ title: 'Configuration Error', description: 'Firebase not configured.', variant: 'destructive' });
        return;
    }


    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      toast({ title: 'Signup Failed', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }

     if (!isPasswordStrong(password)) {
       setError('Password is too weak. Must be 8+ chars, include upper, lower case, and a number.');
       toast({ title: 'Signup Failed', description: 'Password is too weak.', variant: 'destructive' });
      return;
    }


    if (!role) {
      setError('Please select a role.');
       toast({ title: 'Signup Failed', description: 'Please select a role.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Use a placeholder for displayName if not explicitly collected at signup
      const defaultDisplayName = email.split('@')[0]; 
      await signup(email, password, role, defaultDisplayName);
      toast({ title: 'Signup Successful', description: 'Account created. Please log in.' });
      router.push('/login'); // Redirect to login after successful signup
    } catch (err: any) {
      console.error('Signup error:', err);
       // Map Firebase error codes to user-friendly messages
        let errorMessage = 'Failed to create account.';
        if (err.code === 'auth/email-already-in-use') {
            errorMessage = 'This email address is already registered.';
        } else if (err.code === 'auth/invalid-email') {
             errorMessage = 'Invalid email format.';
        } else if (err.code === 'auth/weak-password') {
            // This check is redundant due to isPasswordStrong, but good fallback
             errorMessage = 'Password is too weak.';
        }
      setError(errorMessage);
      toast({ title: 'Signup Failed', description: errorMessage, variant: 'destructive' });
      setLoading(false);
    }
  };

   // Render loading or null while checking auth state or redirecting
   if (authLoading || (user && isFirebaseConfigured)) {
     return <div className="flex h-screen items-center justify-center">Loading...</div>;
   }


  return (
    <div className="flex flex-1 min-h-screen items-center justify-center bg-muted/40 p-4"> {/* Added flex-1 here */}
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
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Enter your details to sign up.</CardDescription>
        </CardHeader>
        <CardContent>
           {showConfigError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Configuration Error</AlertTitle>
                <AlertDescription>
                  Signup is currently unavailable due to a configuration issue. Please contact support.
                </AlertDescription>
              </Alert>
            )}
          <form onSubmit={handleSignup} className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || showConfigError}
                aria-describedby="password-hint"
              />
               <p id="password-hint" className="text-xs text-muted-foreground">
                 Min 8 chars, 1 uppercase, 1 lowercase, 1 number.
               </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || showConfigError}
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select onValueChange={setRole} value={role} required disabled={loading || showConfigError}>
                    <SelectTrigger id="role">
                        <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        {/* Add other roles as needed */}
                    </SelectContent>
                </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || showConfigError}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm text-muted-foreground">
             <p>Already have an account?</p>
             <Link href="/login" className={`text-primary hover:underline font-medium ${showConfigError ? 'pointer-events-none opacity-50' : ''}`}>
                 Log in here
             </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
