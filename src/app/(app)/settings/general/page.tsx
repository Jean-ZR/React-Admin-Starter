
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Save, Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
// Removed Link, usePathname, Tabs, TabsList, TabsTrigger

const generalSettingsSchema = z.object({
  appName: z.string().min(1, "Application name is required."),
  companyName: z.string().optional(),
  systemEmail: z.string().email("Invalid email address.").min(1, "System email is required."),
  defaultLanguage: z.string().min(1, "Default language is required."),
  timezone: z.string().min(1, "Timezone is required."),
  dateFormat: z.string().min(1, "Date format is required."),
  clientPortalEnabled: z.boolean().default(true),
  auditLoggingEnabled: z.boolean().default(true),
  apiAccessEnabled: z.boolean().default(false),
});

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

const GENERAL_CONFIG_DOC_PATH = 'settings/generalConfiguration';

export default function GeneralSettingsPage() {
  const { role, isFirebaseConfigured } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isAdmin = role === 'admin';

  const form = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      appName: "Admin Starter",
      companyName: "",
      systemEmail: "noreply@example.com",
      defaultLanguage: "en",
      timezone: "utc",
      dateFormat: "mmddyyyy",
      clientPortalEnabled: true,
      auditLoggingEnabled: true,
      apiAccessEnabled: false,
    },
  });

  useEffect(() => {
    if (!isFirebaseConfigured || !isAdmin) {
      setIsLoading(false);
      if(isAdmin && !isFirebaseConfigured){ 
        toast({title: "Feature Unavailable", description: "General settings management is unavailable as Firebase is not configured.", variant: "destructive"});
      } else if (!isAdmin && isFirebaseConfigured) {
         toast({title: "Access Denied", description: "You do not have permission to view or modify general settings.", variant: "destructive"});
      }
      return;
    }

    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, GENERAL_CONFIG_DOC_PATH);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          form.reset(docSnap.data() as GeneralSettingsFormData);
        } else {
          console.log("No general settings document found, using defaults.");
        }
      } catch (error) {
        console.error("Error fetching general settings:", error);
        toast({ title: "Error", description: "Could not fetch general settings.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [form, isAdmin, isFirebaseConfigured, toast]);

  const onSubmit: SubmitHandler<GeneralSettingsFormData> = async (data) => {
    if (!isAdmin) {
      toast({ title: "Access Denied", description: "You do not have permission to save settings.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const docRef = doc(db, GENERAL_CONFIG_DOC_PATH);
      await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "Success", description: "General settings saved successfully." });
    } catch (error) {
      console.error("Error saving general settings:", error);
      toast({ title: "Error", description: "Could not save general settings.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Cargando configuración general...</p>
      </div>
    );
  }

  if (!isAdmin && isFirebaseConfigured) { 
     return (
      <div className="space-y-6">
         {/* Title is handled by AppLayout */}
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No tienes permiso para ver o modificar la configuración general del sistema.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!isFirebaseConfigured) { 
    return (
     <div className="space-y-6">
        {/* Title is handled by AppLayout */}
       <Card className="bg-card text-card-foreground border-border">
         <CardHeader>
           <CardTitle className="text-foreground">Función No Disponible</CardTitle>
         </CardHeader>
         <CardContent>
           <p className="text-muted-foreground">Firebase no está configurado. La gestión de la configuración general no está disponible.</p>
         </CardContent>
       </Card>
     </div>
   );
 }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Removed Tabs navigation */}
        {/* Title and description moved to CardHeader or handled by AppLayout */}
        
        <Card className="shadow-sm bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Configuración del Sistema</CardTitle>
            <CardDescription className="text-muted-foreground">Administrar parámetros y preferencias globales del sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4 border-b border-border pb-6">
              <h3 className="text-lg font-medium text-foreground">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="appName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Nombre de la Aplicación</FormLabel>
                      <FormControl><Input {...field} disabled={!isAdmin} className="bg-background border-input text-foreground" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Nombre de la Empresa</FormLabel>
                      <FormControl><Input {...field} placeholder="Tu Empresa Inc." disabled={!isAdmin} className="bg-background border-input text-foreground" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="systemEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Email del Sistema</FormLabel>
                    <FormControl><Input type="email" {...field} placeholder="noreply@tuempresa.com" disabled={!isAdmin} className="bg-background border-input text-foreground" /></FormControl>
                    <FormDescription className="text-xs text-muted-foreground/80">Email usado para enviar notificaciones del sistema.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 border-b border-border pb-6">
              <h3 className="text-lg font-medium text-foreground">Localización</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="defaultLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Idioma Predeterminado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!isAdmin}>
                        <FormControl><SelectTrigger className="bg-background border-input text-foreground"><SelectValue placeholder="Seleccionar idioma" /></SelectTrigger></FormControl>
                        <SelectContent className="bg-popover text-popover-foreground border-border">
                          <SelectItem value="en">English (US)</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Zona Horaria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!isAdmin}>
                        <FormControl><SelectTrigger className="bg-background border-input text-foreground"><SelectValue placeholder="Seleccionar zona horaria" /></SelectTrigger></FormControl>
                        <SelectContent className="max-h-60 bg-popover text-popover-foreground border-border">
                          <SelectItem value="utc">UTC</SelectItem>
                          <SelectItem value="est">EST (UTC-5)</SelectItem>
                          <SelectItem value="pst">PST (UTC-8)</SelectItem>
                          <SelectItem value="cet">CET (UTC+1)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Formato de Fecha</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!isAdmin}>
                        <FormControl><SelectTrigger className="bg-background border-input text-foreground"><SelectValue placeholder="Seleccionar formato" /></SelectTrigger></FormControl>
                        <SelectContent className="bg-popover text-popover-foreground border-border">
                          <SelectItem value="mmddyyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="ddmmyyyy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="yyyymmdd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Indicadores de Funciones</h3>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="clientPortalEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3 border border-border rounded-md bg-background">
                      <FormLabel htmlFor="clientPortalEnabled" className="font-normal mb-0 text-foreground">Habilitar Portal del Cliente</FormLabel>
                      <FormControl><Switch id="clientPortalEnabled" checked={field.value} onCheckedChange={field.onChange} disabled={!isAdmin} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="auditLoggingEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3 border border-border rounded-md bg-background">
                      <FormLabel htmlFor="auditLoggingEnabled" className="font-normal mb-0 text-foreground">Habilitar Registro de Auditoría Detallado</FormLabel>
                      <FormControl><Switch id="auditLoggingEnabled" checked={field.value} onCheckedChange={field.onChange} disabled={!isAdmin} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="apiAccessEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3 border border-border rounded-md bg-background">
                      <FormLabel htmlFor="apiAccessEnabled" className="font-normal mb-0 text-foreground">Habilitar Acceso API</FormLabel>
                      <FormControl><Switch id="apiAccessEnabled" checked={field.value} onCheckedChange={field.onChange} disabled={!isAdmin} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
             <div className="flex justify-end pt-4">
                <Button type="submit" size="sm" className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSaving || !isAdmin}>
                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Guardar Cambios
                </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
