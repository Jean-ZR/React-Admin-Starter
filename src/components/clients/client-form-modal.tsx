
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
  dataAiHint: z.string().optional(),
  documentType: z.enum(["ruc", "dni", "none"], { required_error: "Debe seleccionar un tipo de documento."}).default("none"),
  documentNumber: z.string().optional(),
})
.refine(data => {
    if (data.documentType === "ruc") {
        return !!data.documentNumber && data.documentNumber.length === 11;
    }
    return true;
}, {
    message: "RUC debe tener 11 dígitos.",
    path: ["documentNumber"],
})
.refine(data => {
    if (data.documentType === "dni") {
        return !!data.documentNumber && data.documentNumber.length === 8;
    }
    return true;
}, {
    message: "DNI debe tener 8 dígitos.",
    path: ["documentNumber"],
})
.refine(data => {
    if (data.documentType !== "none" && (!data.documentNumber || data.documentNumber.trim() === "")) {
        return false; 
    }
    return true;
}, {
    message: "El número de documento es obligatorio si se selecciona RUC o DNI.",
    path: ["documentNumber"],
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
const documentTypes = [
    { value: "none", label: "Ninguno" },
    { value: "ruc", label: "RUC" },
    { value: "dni", label: "DNI" },
];

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
      documentType: "none",
      documentNumber: '',
    },
  });

  const watchedDocumentType = form.watch("documentType");

   // Reset form when clientData changes or modal opens
    useEffect(() => {
        if (isOpen) {
            if (clientData) {
                form.reset({
                    ...clientData,
                    documentType: clientData.documentType || "none",
                    documentNumber: clientData.documentNumber || '',
                });
            } else {
                form.reset({
                    name: '', contact: '', email: '', phone: '', address: '', status: '', dataAiHint: 'company client',
                    documentType: "none", documentNumber: ''
                });
            }
        }
    }, [clientData, form, isOpen]);


  const handleFormSubmit: SubmitHandler<ClientFormData> = (data) => {
    const dataToSubmit = {
        ...data,
        documentNumber: data.documentType === 'none' ? '' : data.documentNumber, // Ensure documentNumber is empty if type is none
    };
    onSubmit(dataToSubmit);
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
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Client Name / Business Name *</FormLabel>
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
                    name="documentType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Document Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {documentTypes.map(docType => <SelectItem key={docType.value} value={docType.value}>{docType.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="documentNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>
                            Document Number 
                            {watchedDocumentType === 'ruc' && ' (11 digits)'}
                            {watchedDocumentType === 'dni' && ' (8 digits)'}
                        </FormLabel>
                        <FormControl>
                            <Input 
                                placeholder="Enter document number" 
                                {...field} 
                                value={field.value || ''}
                                disabled={watchedDocumentType === "none"}
                                maxLength={watchedDocumentType === "ruc" ? 11 : (watchedDocumentType === "dni" ? 8 : undefined)}
                            />
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
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., 123 Main St, Anytown, USA 12345" {...field} value={field.value || ''} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="dataAiHint"
                render={({ field }) => (
                  <FormItem className="hidden">
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : (clientData ? 'Save Changes' : 'Add Client')}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


    