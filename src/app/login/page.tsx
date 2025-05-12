'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react'; // Import Loader2

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    router.replace('/dashboard');
    return null; // Render nothing while redirecting
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      toast({ title: 'Login Successful', description: 'Redirecting to dashboard...' });
      router.push('/dashboard'); // Redirect after successful login
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
      toast({ title: 'Login Failed', description: err.message || 'Please check your credentials.', variant: 'destructive' });
      setLoading(false);
    }
    // No need to setLoading(false) on success because we redirect
  };

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
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
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
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                 <Label htmlFor="password">Password</Label>
                 <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                 </Link>
               </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
               {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex flex-col items-center text-sm text-muted-foreground">
            <p>Don't have an account?</p>
            <Link href="/signup" className="text-primary hover:underline font-medium">
                 Sign up here
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
