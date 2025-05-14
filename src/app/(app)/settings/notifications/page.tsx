
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

// Define the structure of notification types for iteration
const notificationTypeDefinitions = [
  { id: 'lowStock', label: 'Low Stock Alert', description: 'When inventory drops below reorder level.' },
  { id: 'newTicket', label: 'New Service Ticket Created', description: 'When a client submits a new request.' },
  { id: 'ticketUpdate', label: 'Service Ticket Updated', description: 'When status or comments change on a ticket.' },
  { id: 'assetWarranty', label: 'Asset Warranty Expiring Soon', description: '30 days before an asset warranty expires.' },
  { id: 'reportReady', label: 'Scheduled Report Ready', description: 'When an automated report has been generated.' },
];

// Default structure if preferences are null
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
    // Sync local state if context preferences change (e.g., after initial load)
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
      if (!newTypes[typeId]) { // Ensure type exists
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
      toast({ title: "Success", description: "Notification preferences saved." });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({ title: "Error", description: "Could not save preferences.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (authLoading && !initialPreferences) {
    return (
        <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading notification settings...</p>
        </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">
          Notification Settings
        </h1>
        <Button size="sm" className="gap-1" onClick={handleSaveChanges} disabled={isSaving || authLoading}>
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configure Notifications</CardTitle>
          <CardDescription>Select which alerts you want to receive and how.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Global Notification Settings</Label>
            <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/30">
              <Switch
                id="global-notifications"
                checked={currentPreferences.globalNotificationsEnabled}
                onCheckedChange={handleGlobalToggle}
              />
              <Label htmlFor="global-notifications">Enable All Notifications</Label>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Notification Types</Label>
            <Card className="overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 p-3 font-medium bg-muted/50 border-b">
                <div className="flex items-center gap-2"><Bell className="h-4 w-4" /> Event Type</div>
                <div className="text-center w-16">Enabled</div>
                <div className="text-center w-16"><Mail className="h-4 w-4 inline-block" /> Email</div>
                <div className="text-center w-16"><Smartphone className="h-4 w-4 inline-block" /> SMS</div>
              </div>
              <div className="divide-y">
                {notificationTypeDefinitions.map(ntDef => {
                  const prefsForType = currentPreferences.types[ntDef.id] || { enabled: false, email: false, sms: false };
                  return (
                    <div key={ntDef.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 p-3 hover:bg-muted/20">
                      <div>
                        <Label htmlFor={`enable-${ntDef.id}`} className="font-normal cursor-pointer">{ntDef.label}</Label>
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
                        />
                      </div>
                      <div className="flex justify-center w-16">
                        <Checkbox
                          id={`sms-${ntDef.id}`}
                          checked={prefsForType.sms}
                          onCheckedChange={(checked) => handleTypeToggle(ntDef.id, 'sms', Boolean(checked))}
                          disabled={!currentPreferences.globalNotificationsEnabled || !prefsForType.enabled}
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
        Configure alert types and delivery methods. Settings are user-specific.
      </p>
    </div>
  );
}
