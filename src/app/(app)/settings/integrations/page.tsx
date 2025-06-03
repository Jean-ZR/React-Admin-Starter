
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Save, Loader2, ShieldAlert, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const APIPERU_CONFIG_DOC_PATH = 'settings/apiPeruConfig'; // Centralized path

const apiPeruConfigSchema = z.object({
  apiUrl: z.string().url("Debe ser una URL válida.").default("https://apiperu.dev").optional(),
  apiToken: z.string().min(10, "El token parece demasiado corto.").optional().or(z.literal('')), // Allow empty string to clear
});

type ApiPeruConfigFormData = z.infer<typeof apiPeruConfigSchema>;

export default function ApiIntegrationsPage() {
  const { role, isFirebaseConfigured, refreshApiPeruToken } = useAuth(); // Added refreshApiPeruToken
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const isAdmin = role === 'admin';

  const form = useForm<ApiPeruConfigFormData>({
    resolver: zodResolver(apiPeruConfigSchema),
    defaultValues: {
      apiUrl: "https://apiperu.dev",
      apiToken: "",
    },
  });

  useEffect(() => {
    if (!isFirebaseConfigured || !isAdmin) {
      setIsLoading(false);
      if(isAdmin && !isFirebaseConfigured){ 
        toast({title: "Función No Disponible", description: "La gestión de integraciones API no está disponible ya que Firebase no está configurado.", variant: "destructive"});
      } else if (!isAdmin && isFirebaseConfigured) {
         toast({title: "Acceso Denegado", description: "No tienes permiso para ver o modificar esta configuración.", variant: "destructive"});
      }
      return;
    }

    const fetchApiConfig = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, APIPERU_CONFIG_DOC_PATH);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          form.reset({
            apiUrl: data.apiUrl || "https://apiperu.dev",
            apiToken: data.apiToken || "",
          });
        }
      } catch (error) {
        console.error("Error fetching APIPeru config:", error);
        toast({ title: "Error", description: "No se pudo cargar la configuración de APIPeru.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiConfig();
  }, [form, isAdmin, isFirebaseConfigured, toast]);

  const onSubmit: SubmitHandler<ApiPeruConfigFormData> = async (data) => {
    if (!isAdmin) {
      toast({ title: "Acceso Denegado", description: "No tienes permiso para guardar esta configuración.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const docRef = doc(db, APIPERU_CONFIG_DOC_PATH);
      await setDoc(docRef, { 
        apiUrl: data.apiUrl || "https://apiperu.dev",
        apiToken: data.apiToken || "", // Store empty string if cleared
        updatedAt: serverTimestamp() 
      }, { merge: true });
      toast({ title: "Éxito", description: "Configuración de APIPeru guardada." });
      await refreshApiPeruToken(); // Refresh token in AuthContext
    } catch (error) {
      console.error("Error saving APIPeru config:", error);
      toast({ title: "Error", description: "No se pudo guardar la configuración de APIPeru.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidateToken = async () => {
    const tokenToTest = form.getValues("apiToken");
    if (!tokenToTest) {
      toast({ title: "Token Requerido", description: "Por favor, ingresa un token para validar.", variant: "destructive" });
      return;
    }
    setIsTesting(true);
    try {
      // Example RUC for testing (SUNAT's RUC)
      const testRuc = "20537924101";
      const response = await fetch(`https://apiperu.dev/api/ruc/${testRuc}`, {
        headers: { 'Authorization': `Bearer ${tokenToTest}`, 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      if (result.success && result.data) {
        toast({
          title: "Token Válido",
          description: `Se obtuvo respuesta para RUC ${testRuc}: ${result.data.nombre_o_razon_social}`,
          variant: "default", // Changed from "success" if not defined
          duration: 7000,
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        });
      } else {
        throw new Error(result.message || "La respuesta de la API no fue exitosa.");
      }
    } catch (error: any) {
      toast({
        title: "Error de Validación de Token",
        description: error.message || "No se pudo validar el token. Verifica el token y tu conexión.",
        variant: "destructive",
        duration: 7000,
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Cargando configuración...</p>
      </div>
    );
  }

  if (!isAdmin && isFirebaseConfigured) { 
     return (
      <div className="space-y-6">
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader><CardTitle className="text-foreground">Acceso Denegado</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">No tienes permiso para acceder a esta sección.</p></CardContent>
        </Card>
      </div>
    );
  }
  
  if (!isFirebaseConfigured && isAdmin) { 
    return (
     <div className="space-y-6">
       <Card className="bg-card text-card-foreground border-border">
         <CardHeader><CardTitle className="text-foreground">Función No Disponible</CardTitle></CardHeader>
         <CardContent><p className="text-muted-foreground">Firebase no está configurado. La gestión de integraciones no está disponible.</p></CardContent>
       </Card>
     </div>
   );
 }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Alert variant="destructive" className="bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700">
          <ShieldAlert className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle className="font-semibold text-yellow-700 dark:text-yellow-300">Consideración de Seguridad Importante</AlertTitle>
          <AlertDescription className="text-yellow-600 dark:text-yellow-400">
            Actualmente, el token de APIPeru se almacena en Firestore y es leído por el frontend para realizar búsquedas de RUC/DNI.
            Para un entorno de producción, se recomienda encarecidamente que las llamadas a APIPeru que utilizan este token se realicen a través de un backend (como una API Route de Next.js o una Firebase Function). Esto protegerá su token de la exposición en el lado del cliente.
          </AlertDescription>
        </Alert>

        <Card className="shadow-sm bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Configuración de APIPeru (Consulta RUC/DNI)</CardTitle>
            <CardDescription className="text-muted-foreground">
              Gestiona la URL y el token para la integración con el servicio de consulta de APIPeru.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="apiUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">URL del API</FormLabel>
                  <FormControl><Input {...field} disabled className="bg-muted/50 border-input text-foreground" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Token de APIPeru</FormLabel>
                  <FormControl><Input type="password" placeholder="Ingresa tu token de APIPeru" {...field} value={field.value || ''} className="bg-background border-input text-foreground" /></FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">Consigue tu token en <a href="https://apiperu.dev" target="_blank" rel="noopener noreferrer" className="underline text-primary">apiperu.dev</a>.</p>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t border-border pt-6">
            <Button type="button" variant="outline" onClick={handleValidateToken} disabled={isSaving || isTesting} className="border-input hover:bg-accent hover:text-accent-foreground">
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Validar Token
            </Button>
            <Button type="submit" size="sm" className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSaving || isTesting}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar Configuración
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

