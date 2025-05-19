
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, KeyRound } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { resetPassword, user, loading: authLoading, isFirebaseConfigured } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [showConfigError, setShowConfigError] = useState(false);

   useEffect(() => {
      if (!authLoading && !isFirebaseConfigured) {
          setShowConfigError(true);
      }
  }, [authLoading, isFirebaseConfigured]);

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
        setError("La recuperación de contraseña está deshabilitada porque Firebase no está configurado correctamente.");
        toast({ title: 'Error de Configuración', description: 'Firebase no configurado.', variant: 'destructive' });
        return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setMessage('Email de recuperación enviado. Por favor, revisa tu bandeja de entrada.');
      toast({ title: 'Email Enviado', description: 'Revisa tu bandeja de entrada para las instrucciones.' });
       setLoading(false); 
    } catch (err: any) {
      console.error('Password reset error:', err);
       let errorMessage = 'Error al enviar el email de recuperación. Inténtalo de nuevo.';
       if (err.code === 'auth/invalid-email') {
           errorMessage = 'Formato de email inválido.';
       } else if (err.code === 'auth/user-not-found') {
           errorMessage = 'No se encontró ningún usuario con este email.';
       }
      setError(errorMessage);
       toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      setLoading(false);
    }
  };

   if (authLoading || (user && isFirebaseConfigured)) {
     return <div className="flex h-screen items-center justify-center bg-slate-50">Cargando...</div>;
   }

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md bg-white border-slate-200 rounded-xl shadow-lg">
        <CardHeader className="text-center space-y-2 pt-8">
           <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground mb-3">
            <KeyRound size={32} />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800">Recuperar Contraseña</CardTitle>
          <CardDescription className="text-slate-500">Ingresa tu email para recibir instrucciones.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
            {showConfigError && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error de Configuración</AlertTitle>
                <AlertDescription>
                  La recuperación de contraseña no está disponible. Contacta al soporte.
                </AlertDescription>
              </Alert>
            )}
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || showConfigError}
                className="h-12 text-base border-slate-300 focus:border-primary focus:ring-primary"
              />
            </div>
            {message && <p className="text-sm text-green-600 text-center">{message}</p>}
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <Button type="submit" className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90" disabled={loading || showConfigError}>
               {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Enviar Email de Recuperación'}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex justify-center text-sm pb-8">
            <Link href="/login" className={`text-primary hover:underline ${showConfigError ? 'pointer-events-none opacity-50' : ''}`}>
                 Volver a Inicio de Sesión
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
