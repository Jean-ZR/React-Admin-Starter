
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import type { ClientFormData } from '@/components/clients/client-form-modal'; // Assuming it exports client structure
import type { Service } from '@/app/(app)/services/catalog/page'; // Assuming it exports service structure
import type { UserData } from '@/components/settings/user-form-modal'; // Assuming it exports user structure
import { Timestamp } from 'firebase/firestore';

// Zod schema for service appointment validation
const appointmentSchema = z.object({
  clientId: z.string().min(1, { message: "Please select a client." }),
  serviceId: z.string().min(1, { message: "Please select a service." }),
  technicianId: z.string().optional(),
  scheduledDate: z.date({ required_error: "Please select a date." }),
  scheduledTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:MM)." }),
  status: z.string().min(1, { message: "Please select a status." }),
  notes: z.string().optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

export interface ClientForSelect {
  id: string;
  name: string;
}
export interface ServiceForSelect {
  id: string;
  name: string;
}
export interface TechnicianForSelect {
  id: string;
  displayName: string | null;
}

interface ServiceAppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  appointmentData?: (AppointmentFormData & { id?: string; scheduledDate?: any; }) | null;
  availableClients: ClientForSelect[];
  availableServices: ServiceForSelect[];
  availableTechnicians: TechnicianForSelect[];
  defaultDate?: Date;
}

const appointmentStatuses = ["Scheduled", "Confirmed", "In Progress", "Completed", "Cancelled"];

export function ServiceAppointmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  appointmentData,
  availableClients,
  availableServices,
  availableTechnicians,
  defaultDate
}: ServiceAppointmentFormModalProps) {
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clientId: '',
      serviceId: '',
      technicianId: '',
      scheduledDate: defaultDate || new Date(),
      scheduledTime: '09:00',
      status: 'Scheduled',
      notes: '',
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      if (appointmentData) {
        form.reset({
          ...appointmentData,
          scheduledDate: appointmentData.scheduledDate instanceof Timestamp 
                           ? appointmentData.scheduledDate.toDate() 
                           : appointmentData.scheduledDate || defaultDate || new Date(),
        });
      } else {
        form.reset({
          clientId: '',
          serviceId: '',
          technicianId: '',
          scheduledDate: defaultDate || new Date(),
          scheduledTime: '09:00',
          status: 'Scheduled',
          notes: '',
        });
      }
    }
  }, [appointmentData, form, isOpen, defaultDate]);

  const handleFormSubmit: SubmitHandler<AppointmentFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting appointment form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{appointmentData ? 'Edit Appointment' : 'Schedule New Appointment'}</DialogTitle>
          <DialogDescription>
            {appointmentData ? 'Update the details of this appointment.' : 'Fill in the details for the new appointment.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableClients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableServices.map(service => (
                        <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date *</FormLabel>
                    <DatePicker value={field.value} onSelect={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scheduledTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time (HH:MM) *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="technicianId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technician (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''} defaultValue={field.value || ''}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a technician (optional)" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">-- None --</SelectItem>
                      {availableTechnicians.map(tech => (
                        <SelectItem key={tech.id} value={tech.id}>{tech.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {appointmentStatuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes about the appointment..." {...field} value={field.value || ''} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {appointmentData ? 'Save Changes' : 'Schedule Appointment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    