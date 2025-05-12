import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold leading-none tracking-tight">
            General Settings
          </h1>
           <Button size="sm" className="gap-1"><Save className="h-3.5 w-3.5"/> Save Changes</Button>
       </div>

      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
          <CardDescription>Manage system-wide parameters and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           {/* Section 1: Basic Information */}
           <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-medium">Basic Information</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="appName">Application Name</Label>
                   <Input id="appName" defaultValue="Admin Starter" />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="companyName">Company Name</Label>
                   <Input id="companyName" placeholder="Your Company Inc."/>
                 </div>
               </div>
                 <div className="space-y-2">
                   <Label htmlFor="systemEmail">System Email Address</Label>
                   <Input id="systemEmail" type="email" placeholder="noreply@yourcompany.com" />
                    <p className="text-xs text-muted-foreground">Email address used for sending system notifications.</p>
                 </div>
           </div>

           {/* Section 2: Localization */}
           <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-medium">Localization</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="language">Default Language</Label>
                    <Select>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (US)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                         <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="timezone">Timezone</Label>
                     <Select>
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                         {/* Add more timezones as needed */}
                         <SelectItem value="utc">UTC</SelectItem>
                         <SelectItem value="est">EST (UTC-5)</SelectItem>
                        <SelectItem value="pst">PST (UTC-8)</SelectItem>
                         <SelectItem value="cet">CET (UTC+1)</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
                  <div className="space-y-2">
                   <Label htmlFor="dateFormat">Date Format</Label>
                     <Select>
                      <SelectTrigger id="dateFormat">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="mmddyyyy">MM/DD/YYYY</SelectItem>
                         <SelectItem value="ddmmyyyy">DD/MM/YYYY</SelectItem>
                         <SelectItem value="yyyymmdd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </div>
           </div>

            {/* Section 3: Features */}
           <div className="space-y-4">
              <h3 className="text-lg font-medium">Feature Flags</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-md">
                    <Label htmlFor="clientPortal" className="font-normal">Enable Client Portal</Label>
                    <Switch id="clientPortal" defaultChecked/>
                 </div>
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <Label htmlFor="auditLog" className="font-normal">Enable Detailed Audit Logging</Label>
                    <Switch id="auditLog" defaultChecked />
                 </div>
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <Label htmlFor="apiAccess" className="font-normal">Enable API Access</Label>
                    <Switch id="apiAccess" />
                 </div>
              </div>
           </div>

        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Manage general system configuration. Changes require appropriate permissions. Audit logs track modifications.
      </p>
    </div>
  );
}
