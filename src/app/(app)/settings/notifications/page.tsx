import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Smartphone } from "lucide-react";
import { Save } from "lucide-react";

const notificationTypes = [
  { id: 'lowStock', label: 'Low Stock Alert', description: 'When inventory drops below reorder level.' },
  { id: 'newTicket', label: 'New Service Ticket Created', description: 'When a client submits a new request.' },
  { id: 'ticketUpdate', label: 'Service Ticket Updated', description: 'When status or comments change on a ticket.' },
  { id: 'assetWarranty', label: 'Asset Warranty Expiring Soon', description: '30 days before an asset warranty expires.' },
  { id: 'reportReady', label: 'Scheduled Report Ready', description: 'When an automated report has been generated.' },
];

export default function NotificationSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold leading-none tracking-tight">
            Notification Settings
          </h1>
           <Button size="sm" className="gap-1"><Save className="h-3.5 w-3.5"/> Save Preferences</Button>
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
                <Switch id="global-notifications" defaultChecked />
                <Label htmlFor="global-notifications">Enable All Notifications</Label>
            </div>
           </div>

           <div className="space-y-4">
             <Label className="text-base font-semibold">Notification Types</Label>
              <Card className="overflow-hidden">
               {/* Header Row */}
                 <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 p-3 font-medium bg-muted/50 border-b">
                    <div className="flex items-center gap-2"><Bell className="h-4 w-4"/> Event Type</div>
                    <div className="text-center w-16">Enabled</div>
                    <div className="text-center w-16"><Mail className="h-4 w-4 inline-block"/> Email</div>
                    <div className="text-center w-16"><Smartphone className="h-4 w-4 inline-block"/> SMS</div>
                 </div>
                {/* Notification Rows */}
                 <div className="divide-y">
                 {notificationTypes.map(nt => (
                   <div key={nt.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 p-3 hover:bg-muted/20">
                      <div>
                         <Label htmlFor={`enable-${nt.id}`} className="font-normal cursor-pointer">{nt.label}</Label>
                         <p className="text-xs text-muted-foreground">{nt.description}</p>
                       </div>
                       <div className="flex justify-center w-16">
                         <Switch id={`enable-${nt.id}`} defaultChecked={['lowStock', 'newTicket'].includes(nt.id)} />
                       </div>
                       <div className="flex justify-center w-16">
                          <Checkbox id={`email-${nt.id}`} defaultChecked={['lowStock', 'newTicket', 'reportReady'].includes(nt.id)} />
                       </div>
                        <div className="flex justify-center w-16">
                          <Checkbox id={`sms-${nt.id}`} defaultChecked={['lowStock'].includes(nt.id)} />
                       </div>
                   </div>
                 ))}
                 </div>
              </Card>
           </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Configure alert types and delivery methods (e.g., email, SMS, in-app). Settings are user-specific but may require admin configuration for delivery methods. Audit logs track changes.
      </p>
    </div>
  );
}
