
'use client';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, User, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from 'react'; 
import { format } from 'date-fns'; 
// Removed Tabs, TabsList, TabsTrigger, Link, usePathname

const mockEvents = [
   { id: 'EVT001', date: '2024-08-15', time: '10:00 AM', service: 'Network Setup', client: 'Beta Industries', technician: 'John Doe', status: 'Scheduled' },
   { id: 'EVT002', date: '2024-08-15', time: '02:00 PM', service: 'Standard IT Support', client: 'Alpha Corp', technician: 'Jane Smith', status: 'Scheduled' },
   { id: 'EVT003', date: '2024-08-20', time: '09:00 AM', service: 'Server Maintenance', client: 'Gamma Solutions', technician: 'John Doe', status: 'Completed' },
];


export default function ServiceSchedulingPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const selectedDateString = date ? format(date, "yyyy-MM-dd") : null;
  const todaysEvents = selectedDateString
    ? mockEvents.filter(event => event.date === selectedDateString)
    : [];

  return (
    <div className="space-y-6">
      {/* Removed Tabs navigation - now handled by sidebar accordion */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         {/* Title is now handled by layout.tsx */}
         <div className="flex-1"></div> {/* Spacer */}
         <Button size="sm" className="h-9 gap-1 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Schedule Service</span>
          </Button>
      </div>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Service Calendar</CardTitle>
          <CardDescription className="text-muted-foreground">Manage and view scheduled service appointments.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-[auto_1fr] lg:grid-cols-[280px_1fr]">
          <div className="border border-border rounded-md p-3 self-start bg-background">
             <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
            />
             <p className="text-xs text-center text-muted-foreground mt-2">(Select a date to view events)</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Events for: {date ? format(date, "PPP") : "Select a date"}
            </h3>
            <div className="space-y-3 min-h-[200px]">
              {todaysEvents.length > 0 ? (
                todaysEvents.map(event => (
                   <Card key={event.id} className={`border-border bg-background ${event.status === 'Completed' ? 'opacity-70' : ''}`}>
                    <CardContent className="p-4 flex justify-between items-start gap-4">
                      <div>
                        <p className="font-semibold text-foreground">{event.service}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> {event.client}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {event.time} - {event.technician}</p>
                      </div>
                      <Badge
                        variant={event.status === 'Completed' ? 'default' : 'outline'}
                        className={event.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700' : 'text-muted-foreground border-border'}
                       >
                         {event.status === 'Completed' && <Check className="h-3 w-3 mr-1"/>}
                         {event.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground italic pt-4">No events scheduled for this date.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Calendar-based service management. Requires a full calendar component implementation for visual event display. Audit logs and role-based access are applied.
      </p>
    </div>
  );
}
