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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { resetPassword, user } = useAuth();
  const router = useRouter();
   const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    router.replace('/dashboard');
    return null; // Render nothing while redirecting
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await resetPassword(email);
      setMessage('Password reset email sent. Please check your inbox.');
      toast({ title: 'Email Sent', description: 'Check your inbox for reset instructions.' });
       setLoading(false); // Keep form enabled after success message
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
       toast({ title: 'Error', description: err.message || 'Could not send reset email.', variant: 'destructive' });
      setLoading(false);
    }
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
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your email to receive reset instructions.</CardDescription>
        </CardHeader>
        <CardContent>
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
                disabled={loading}
              />
            </div>
            {message && <p className="text-sm text-green-600">{message}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
               {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Email'}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex justify-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
                 Back to Login
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
