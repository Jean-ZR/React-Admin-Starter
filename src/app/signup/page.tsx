
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, UserPlus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signup, user, loading: authLoading, isFirebaseConfigured } = useAuth();
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

  const isPasswordStrong = (pw: string): boolean => {
    return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

     if (!isFirebaseConfigured) {
        setError("El registro está deshabilitado porque Firebase no está configurado correctamente. Por favor, contacta al administrador.");
        toast({ title: 'Error de Configuración', description: 'Firebase no configurado.', variant: 'destructive' });
        return;
    }

    if (!displayName.trim()) {
      setError('Por favor, ingresa tu nombre.');
      toast({ title: 'Fallo de Registro', description: 'El nombre es requerido.', variant: 'destructive' });
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      toast({ title: 'Fallo de Registro', description: 'Las contraseñas no coinciden.', variant: 'destructive' });
      return;
    }

     if (!isPasswordStrong(password)) {
       setError('La contraseña es muy débil. Debe tener más de 8 caracteres, incluir mayúsculas, minúsculas y un número.');
       toast({ title: 'Fallo de Registro', description: 'Contraseña débil.', variant: 'destructive' });
      return;
    }

    if (!role) {
      setError('Por favor, selecciona un rol.');
       toast({ title: 'Fallo de Registro', description: 'Por favor, selecciona un rol.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, role, displayName);
      toast({ title: 'Registro Exitoso', description: 'Cuenta creada. Por favor, inicia sesión.' });
      router.push('/login'); 
    } catch (err: any) {
      console.error('Signup error:', err);
        let errorMessage = 'Error al crear la cuenta.';
        if (err.code === 'auth/email-already-in-use') {
            errorMessage = 'Esta dirección de email ya está registrada.';
        } else if (err.code === 'auth/invalid-email') {
             errorMessage = 'Formato de email inválido.';
        } else if (err.code === 'auth/weak-password') {
             errorMessage = 'La contraseña es muy débil.';
        }
      setError(errorMessage);
      toast({ title: 'Fallo de Registro', description: errorMessage, variant: 'destructive' });
      setLoading(false);
    }
  };

   if (authLoading || (user && isFirebaseConfigured)) {
     return <div className="flex h-screen items-center justify-center bg-background text-foreground">Cargando...</div>;
   }

  return (
    <div className="flex flex-1 min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground border-border rounded-xl shadow-lg">
        <CardHeader className="text-center space-y-2 pt-8">
           <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground mb-3">
            <UserPlus size={32} />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">Crear Cuenta</CardTitle>
          <CardDescription className="text-muted-foreground">Ingresa tus datos para registrarte.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
           {showConfigError && (
              <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/30 text-destructive">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertTitle>Error de Configuración</AlertTitle>
                <AlertDescription>
                  El registro no está disponible debido a un problema de configuración. Contacta al soporte.
                </AlertDescription>
              </Alert>
            )}
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-sm font-medium text-foreground">Nombre Completo</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Ej: Juan Pérez"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading || showConfigError}
                className="h-11 text-base bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || showConfigError}
                className="h-11 text-base bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || showConfigError}
                aria-describedby="password-hint"
                className="h-11 text-base bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
               <p id="password-hint" className="text-xs text-muted-foreground">
                 Mín. 8 caracteres, 1 mayúscula, 1 minúscula, 1 número.
               </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || showConfigError}
                className="h-11 text-base bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="role" className="text-sm font-medium text-foreground">Rol</Label>
                <Select onValueChange={setRole} value={role} required disabled={loading || showConfigError}>
                    <SelectTrigger id="role" className="h-11 text-base bg-background border-input text-foreground focus:border-primary focus:ring-primary">
                        <SelectValue placeholder="Selecciona tu rol" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground">
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="teacher">Profesor</SelectItem>
                        <SelectItem value="student">Estudiante</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading || showConfigError}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Registrarse'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm text-muted-foreground pb-8">
             <p>¿Ya tienes una cuenta?</p>
             <Link href="/login" className={`text-primary hover:underline font-medium ${showConfigError ? 'pointer-events-none opacity-50' : ''}`}>
                 Inicia sesión aquí
             </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
