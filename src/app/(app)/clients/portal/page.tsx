import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ticket, MessageSquare, FileText } from "lucide-react";

export default function ClientPortalPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold leading-none tracking-tight">
        Client Portal
      </h1>
      <p className="text-muted-foreground">Interface for client interactions and service requests.</p>

       <Card>
         <CardHeader>
           <CardTitle>Welcome, Client Name!</CardTitle> {/* Dynamically set */}
           <CardDescription>Access your services and support requests here.</CardDescription>
         </CardHeader>
         <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="flex flex-col items-center justify-center p-6 text-center">
                <Ticket className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Submit New Request</h3>
                <p className="text-sm text-muted-foreground mb-4">Need assistance? Open a new service ticket.</p>
                <Button size="sm">Create Ticket</Button>
            </Card>
             <Card className="flex flex-col items-center justify-center p-6 text-center">
                <MessageSquare className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">View Open Tickets</h3>
                <p className="text-sm text-muted-foreground mb-4">Check the status of your ongoing requests.</p>
                 <Button size="sm" variant="outline">View Tickets</Button>
             </Card>
              <Card className="flex flex-col items-center justify-center p-6 text-center">
                <FileText className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Knowledge Base</h3>
                <p className="text-sm text-muted-foreground mb-4">Find answers and guides in our help center.</p>
                <Button size="sm" variant="outline">Browse Articles</Button>
              </Card>
         </CardContent>
       </Card>

      {/* Example: Simplified New Service Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit a Service Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="grid gap-2">
              <label htmlFor="request-type" className="text-sm font-medium">Request Type</label>
             <Select>
              <SelectTrigger id="request-type">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="support">Technical Support</SelectItem>
                <SelectItem value="billing">Billing Inquiry</SelectItem>
                <SelectItem value="maintenance">Maintenance Request</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
           </div>
           <div className="grid gap-2">
             <label htmlFor="subject" className="text-sm font-medium">Subject</label>
             <Input id="subject" placeholder="Briefly describe the issue" />
           </div>
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea id="description" placeholder="Provide details about your request" rows={5} />
          </div>
          <div className="flex justify-end">
             <Button>Submit Request</Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        This page simulates the client-facing portal. Role-based access ensures clients only see their own information. Audit logs track interactions.
      </p>
    </div>
  );
}
