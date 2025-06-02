
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Smartphone, Save, Loader2 } from "lucide-react";
import { useAuth, type NotificationPreferences } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
// Removed Link, usePathname, Tabs, TabsList, TabsTrigger

const notificationTypeDefinitions = [
  { id: 'lowStock', label: 'Alerta de Stock Bajo', description: 'Cuando el inventario cae por debajo del nivel de reorden.' },
  { id: 'newTicket', label: 'Nuevo Ticket de Servicio Creado', description: 'Cuando un cliente envía una nueva solicitud.' },
  { id: 'ticketUpdate', label: 'Ticket de Servicio Actualizado', description: 'Cuando el estado o los comentarios cambian en un ticket.' },
  { id: 'assetWarranty', label: 'Garantía de Activo por Expirar', description: '30 días antes de que expire la garantía de un activo.' },
  { id: 'reportReady', label: 'Reporte Programado Listo', description: 'Cuando se ha generado un reporte automatizado.' },
];

const defaultPreferences: NotificationPreferences = {
  globalNotificationsEnabled: true,
  types: {
    lowStock: { enabled: true, email: true, sms: false },
    newTicket: { enabled: true, email: true, sms: false },
    ticketUpdate: { enabled: true, email: false, sms: false },
    assetWarranty: { enabled: true, email: true, sms: false },
    reportReady: { enabled: false, email: false, sms: false },
  }
};


export default function NotificationSettingsPage() {
  const { notificationPreferences: initialPreferences, updateUserPreferences, loading: authLoading } = useAuth();
  const [currentPreferences, setCurrentPreferences] = useState<NotificationPreferences>(initialPreferences || defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialPreferences) {
      setCurrentPreferences(initialPreferences);
    }
  }, [initialPreferences]);

  const handleGlobalToggle = (checked: boolean) => {
    setCurrentPreferences(prev => ({ ...prev, globalNotificationsEnabled: checked }));
  };

  const handleTypeToggle = (typeId: string, field: 'enabled' | 'email' | 'sms', checked: boolean) => {
    setCurrentPreferences(prev => {
      const newTypes = { ...prev.types };
      if (!newTypes[typeId]) { 
        newTypes[typeId] = { enabled: false, email: false, sms: false };
      }
      newTypes[typeId] = { ...newTypes[typeId], [field]: checked };
      return { ...prev, types: newTypes };
    });
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateUserPreferences(currentPreferences);
      toast({ title: "Éxito", description: "Preferencias de notificación guardadas." });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({ title: "Error", description: "No se pudieron guardar las preferencias.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (authLoading && !initialPreferences) {
    return (
        <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Cargando configuración de notificaciones...</p>
        </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Removed Tabs navigation */}
      <div className="flex items-center justify-between">
         {/* Title handled by AppLayout */}
         <div className="flex-1"></div> {/* Spacer */}
        <Button size="sm" className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSaveChanges} disabled={isSaving || authLoading}>
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {isSaving ? 'Guardando...' : 'Guardar Preferencias'}
        </Button>
      </div>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Configurar Notificaciones</CardTitle>
          <CardDescription className="text-muted-foreground">Selecciona qué alertas deseas recibir y cómo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold text-foreground">Configuración Global de Notificaciones</Label>
            <div className="flex items-center space-x-2 p-3 border border-border rounded-md bg-background">
              <Switch
                id="global-notifications"
                checked={currentPreferences.globalNotificationsEnabled}
                onCheckedChange={handleGlobalToggle}
              />
              <Label htmlFor="global-notifications" className="text-foreground">Habilitar Todas las Notificaciones</Label>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold text-foreground">Tipos de Notificación</Label>
            <Card className="overflow-hidden bg-background border-border">
              <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 p-3 font-medium bg-muted/50 border-b border-border">
                <div className="flex items-center gap-2 text-muted-foreground"><Bell className="h-4 w-4" /> Tipo de Evento</div>
                <div className="text-center w-16 text-muted-foreground">Habilitado</div>
                <div className="text-center w-16 text-muted-foreground"><Mail className="h-4 w-4 inline-block" /> Email</div>
                <div className="text-center w-16 text-muted-foreground"><Smartphone className="h-4 w-4 inline-block" /> SMS</div>
              </div>
              <div className="divide-y divide-border">
                {notificationTypeDefinitions.map(ntDef => {
                  const prefsForType = currentPreferences.types[ntDef.id] || { enabled: false, email: false, sms: false };
                  return (
                    <div key={ntDef.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 p-3 hover:bg-muted/20">
                      <div>
                        <Label htmlFor={`enable-${ntDef.id}`} className="font-normal cursor-pointer text-foreground">{ntDef.label}</Label>
                        <p className="text-xs text-muted-foreground">{ntDef.description}</p>
                      </div>
                      <div className="flex justify-center w-16">
                        <Switch
                          id={`enable-${ntDef.id}`}
                          checked={prefsForType.enabled}
                          onCheckedChange={(checked) => handleTypeToggle(ntDef.id, 'enabled', checked)}
                          disabled={!currentPreferences.globalNotificationsEnabled}
                        />
                      </div>
                      <div className="flex justify-center w-16">
                        <Checkbox
                          id={`email-${ntDef.id}`}
                          checked={prefsForType.email}
                          onCheckedChange={(checked) => handleTypeToggle(ntDef.id, 'email', Boolean(checked))}
                          disabled={!currentPreferences.globalNotificationsEnabled || !prefsForType.enabled}
                          className="border-primary"
                        />
                      </div>
                      <div className="flex justify-center w-16">
                        <Checkbox
                          id={`sms-${ntDef.id}`}
                          checked={prefsForType.sms}
                          onCheckedChange={(checked) => handleTypeToggle(ntDef.id, 'sms', Boolean(checked))}
                          disabled={!currentPreferences.globalNotificationsEnabled || !prefsForType.enabled}
                          className="border-primary"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Configura tipos de alerta y métodos de entrega. La configuración es específica del usuario.
      </p>
    </div>
  );
}
