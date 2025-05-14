
'use client';

import React, { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

// Define Zod schema for validation
const clientSchema = z.object({
  name: z.string().min(2, { message: "Client name must be at least 2 characters." }),
  contact: z.string().min(2, { message: "Contact name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string()
    .regex(/^\d{9}$/, { message: "Phone number must be 9 digits." })
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
  status: z.string().min(1, { message: "Please select a status." }),
  dataAiHint: z.string().optional(), // Added for consistency, can be auto-generated
});

export type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => void;
  clientData?: ClientFormData | null; // Data for editing
}

// Example data for selects
const statuses = ["Active", "Inactive", "Prospect"];

export function ClientFormModal({ isOpen, onClose, onSubmit, clientData }: ClientFormModalProps) {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: clientData || {
      name: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
      status: '',
      dataAiHint: 'company client',
    },
  });

   // Reset form when clientData changes
    useEffect(() => {
        if (clientData) {
            form.reset(clientData);
        } else {
            form.reset({
                name: '', contact: '', email: '', phone: '', address: '', status: '', dataAiHint: 'company client'
            });
        }
    }, [clientData, form]);


  const handleFormSubmit: SubmitHandler<ClientFormData> = (data) => {
    onSubmit(data);
    onClose(); // Close modal after submit
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{clientData ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogDescription>
            {clientData ? 'Update the details of the client.' : 'Fill in the details for the new client.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
            {/* Form Fields */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Client Name *</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., Alpha Corp" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Contact Person *</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., Alice Johnson" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                 />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                        <Input type="email" placeholder="e.g., contact@alpha.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                 />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone (9 digits)</FormLabel>
                        <FormControl>
                        <Input type="tel" placeholder="e.g., 987654321" {...field} />
                        </FormControl>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {statuses.map(stat => <SelectItem key={stat} value={stat}>{stat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                 />
             </div>
              {/* Address Textarea */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., 123 Main St, Anytown, USA 12345" {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="dataAiHint"
                render={({ field }) => (
                  <FormItem className="hidden"> {/* Hidden field for AI hint, can be made visible if needed */}
                    <FormLabel>AI Hint</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <DialogFooter>
               <DialogClose asChild>
                 <Button type="button" variant="outline">Cancel</Button>
               </DialogClose>
              <Button type="submit">{clientData ? 'Save Changes' : 'Add Client'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
