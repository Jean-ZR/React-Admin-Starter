
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
import { Loader2, AlertTriangle, Truck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, user, loading: authLoading, isFirebaseConfigured } = useAuth();
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFirebaseConfigured) {
        setError("El inicio de sesión está deshabilitado porque Firebase no está configurado correctamente. Por favor, contacta al administrador.");
        toast({ title: 'Error de Configuración', description: 'Firebase no configurado.', variant: 'destructive' });
        return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      toast({ title: 'Inicio de Sesión Exitoso', description: 'Redirigiendo al panel...' });
      router.push('/dashboard'); 
    } catch (err: any) {
      console.error('Login error:', err);
      if (isFirebaseConfigured && (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password')) {
        console.log("[LOGIN_PAGE] Firebase está configurado. El error 'auth/invalid-credential' sugiere que el email/contraseña es incorrecto para este proyecto, o la cuenta no existe/está deshabilitada.");
      }
        let errorMessage = 'Error al iniciar sesión. Por favor, verifica tus credenciales.';
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            errorMessage = 'Email o contraseña inválidos.';
        } else if (err.code === 'auth/invalid-email') {
             errorMessage = 'Formato de email inválido.';
        } else if (err.code === 'auth/too-many-requests') {
             errorMessage = 'Demasiados intentos de inicio de sesión. Por favor, inténtalo más tarde.';
        }
      setError(errorMessage);
      toast({ title: 'Fallo de Inicio de Sesión', description: errorMessage, variant: 'destructive' });
      setLoading(false);
    }
  };

   if (authLoading || (user && isFirebaseConfigured)) {
       return <div className="flex h-screen items-center justify-center bg-slate-50">Cargando...</div>;
   }

  return (
    <div className="flex flex-1 min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md bg-white border-slate-200 rounded-xl shadow-lg">
        <CardHeader className="text-center space-y-2 pt-8">
           <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground mb-3">
            <Truck size={32} />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800">Bienvenido</CardTitle>
          <CardDescription className="text-slate-500">Ingresa tus credenciales para acceder al sistema.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
           {showConfigError && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error de Configuración</AlertTitle>
                <AlertDescription>
                  El inicio de sesión no está disponible debido a un problema de configuración. Contacta al soporte.
                </AlertDescription>
              </Alert>
            )}
          <form onSubmit={handleLogin} className="space-y-6">
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
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                 <Label htmlFor="password" className="text-sm font-medium text-slate-700">Contraseña</Label>
                 <Link href="/forgot-password" className={`text-sm text-primary hover:underline ${showConfigError ? 'pointer-events-none opacity-50' : ''}`}>
                    ¿Olvidaste tu contraseña?
                 </Link>
               </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || showConfigError}
                className="h-12 text-base border-slate-300 focus:border-primary focus:ring-primary"
              />
            </div>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <Button type="submit" className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90" disabled={loading || showConfigError}>
               {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex flex-col items-center text-sm text-slate-500 pb-8">
            <p>¿No tienes una cuenta?</p>
            <Link href="/signup" className={`text-primary hover:underline font-medium ${showConfigError ? 'pointer-events-none opacity-50' : ''}`}>
                 Regístrate aquí
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
