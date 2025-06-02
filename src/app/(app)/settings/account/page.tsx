
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Save, Moon, Sun, Monitor, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
// Removed Link, usePathname, Tabs, TabsList, TabsTrigger

export default function AccountSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { languagePreference: contextLanguagePreference, updateUserLanguagePreference, loading: authLoading } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(contextLanguagePreference || 'en');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (contextLanguagePreference) {
      setSelectedLanguage(contextLanguagePreference);
    }
  }, [contextLanguagePreference]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      if (selectedLanguage !== contextLanguagePreference) {
        await updateUserLanguagePreference(selectedLanguage);
      }
      toast({ title: 'Éxito', description: 'Configuración de cuenta guardada.' });
    } catch (error) {
      console.error('Error saving account settings:', error);
      toast({ title: 'Error', description: 'No se pudo guardar la configuración de la cuenta.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading && !contextLanguagePreference) { 
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Cargando configuración de cuenta...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Removed Tabs navigation */}
      <div className="flex items-center justify-between">
        {/* Title is now managed by AppLayout */}
        <div className="flex-1"></div> {/* Spacer */}
        <Button size="sm" className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSaveChanges} disabled={isSaving || authLoading}>
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Apariencia</CardTitle>
          <CardDescription className="text-muted-foreground">Personaliza la apariencia de la aplicación.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme" className="text-muted-foreground">Tema</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme" className="w-[200px] bg-background border-input text-foreground">
                <SelectValue placeholder="Seleccionar tema" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" /> Claro
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" /> Oscuro
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" /> Sistema
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Selecciona tu esquema de color preferido.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Idioma y Región</CardTitle>
          <CardDescription className="text-muted-foreground">Gestionar la configuración de idioma y regional.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language" className="text-muted-foreground">Idioma de la Aplicación</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger id="language" className="w-[200px] bg-background border-input text-foreground">
                <SelectValue placeholder="Seleccionar idioma" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                <SelectItem value="en">English (US)</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Selecciona tu idioma preferido. La localización completa de la app podría no estar completa.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Preferencias de Notificación</CardTitle>
          <CardDescription className="text-muted-foreground">Gestiona cómo recibes las notificaciones.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4 text-muted-foreground">
            Configura detalladamente las notificaciones para diversos eventos como alertas, actualizaciones y mensajes del sistema.
          </p>
          <Button variant="outline" asChild className="border-input hover:bg-accent hover:text-accent-foreground">
            <Link href="/settings/notifications">
              Ir a Configuración de Notificaciones
            </Link>
          </Button>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Gestiona tus preferencias personales de cuenta.
      </p>
    </div>
  );
}
