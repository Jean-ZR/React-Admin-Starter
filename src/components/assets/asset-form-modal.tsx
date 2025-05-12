'use client';

import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker'; // Assuming date picker handles date objects or strings
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
const assetSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  status: z.string().min(1, { message: "Please select a status." }),
  location: z.string().optional(),
  assignedTo: z.string().optional(),
  serialNumber: z.string().optional(),
  cost: z.coerce.number().positive({ message: "Cost must be a positive number." }).optional().or(z.literal('')), // Allow empty string or positive number
  purchaseDate: z.date().optional().nullable(), // Assuming DatePicker provides Date object
  warrantyEnd: z.date().optional().nullable(),
  description: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssetFormData) => void;
  assetData?: AssetFormData | null; // Data for editing
}

// Example data for selects (replace with fetched data if needed)
const categories = ["Electronics", "Furniture", "Office Supplies", "Software Licenses"];
const statuses = ["Active", "Inactive", "In Repair", "Disposed"];

export function AssetFormModal({ isOpen, onClose, onSubmit, assetData }: AssetFormModalProps) {
  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: assetData || {
      name: '',
      category: '',
      status: '',
      location: '',
      assignedTo: '',
      serialNumber: '',
      cost: '',
      purchaseDate: null,
      warrantyEnd: null,
      description: '',
    },
  });

   // Reset form when assetData changes (e.g., opening modal for different asset)
    useEffect(() => {
        if (assetData) {
        form.reset({
            ...assetData,
            cost: assetData.cost || '', // Ensure cost is handled correctly
            // Convert date strings to Date objects if necessary, depending on DatePicker
            // purchaseDate: assetData.purchaseDate ? new Date(assetData.purchaseDate) : null,
            // warrantyEnd: assetData.warrantyEnd ? new Date(assetData.warrantyEnd) : null,
        });
        } else {
        form.reset({
            name: '', category: '', status: '', location: '', assignedTo: '',
            serialNumber: '', cost: '', purchaseDate: null, warrantyEnd: null, description: ''
        });
        }
    }, [assetData, form]);


  const handleFormSubmit: SubmitHandler<AssetFormData> = (data) => {
     const processedData = {
        ...data,
        cost: data.cost === '' ? undefined : Number(data.cost) // Convert empty string to undefined or number
    };
    onSubmit(processedData);
    onClose(); // Close modal after submit
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{assetData ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
          <DialogDescription>
            {assetData ? 'Update the details of the asset.' : 'Fill in the details for the new asset.'}
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
                    <FormLabel>Asset Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Laptop Pro 15" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                         <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                         </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
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
               <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Office A, Storage" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., SN12345XYZ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="cost"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Cost ($)</FormLabel>
                     <FormControl>
                       <Input type="number" placeholder="e.g., 1200.00" step="0.01" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
                {/* Add Date Pickers - Assuming DatePicker component integrates with react-hook-form */}
               {/* <FormField name="purchaseDate" render={...} /> */}
                {/* <FormField name="warrantyEnd" render={...} /> */}

            </div>
             {/* Description Textarea */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes about the asset..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


            <DialogFooter>
               <DialogClose asChild>
                 <Button type="button" variant="outline">Cancel</Button>
               </DialogClose>
              <Button type="submit">{assetData ? 'Save Changes' : 'Add Asset'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```
  </change>
  <change>
    <file>src/components/clients/client-form-modal.tsx</file>
    <description>Create a reusable modal component for adding/editing clients.</description>
    <content><![CDATA['use client';

import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
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
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }).optional().or(z.literal('')),
  address: z.string().optional(),
  status: z.string().min(1, { message: "Please select a status." }),
  // Add other fields as needed, e.g., notes: z.string().optional()
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => void;
  clientData?: ClientFormData | null; // Data for editing
}

// Example data for selects (replace with fetched data if needed)
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
    },
  });

   // Reset form when clientData changes
    useEffect(() => {
        if (clientData) {
            form.reset(clientData);
        } else {
            form.reset({
                name: '', contact: '', email: '', phone: '', address: '', status: ''
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
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                        <Input type="tel" placeholder="e.g., 555-123-4567" {...field} />
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
```
  </change>
  <change>
    <file>src/components/delete-confirmation-dialog.tsx</file>
    <description>Create a reusable delete confirmation dialog component.</description>
    <content><![CDATA['use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from './ui/button'; // For styling action button

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string; // Optional item name for more specific message
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName = "this item",
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete {itemName}
            and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
           {/* Apply destructive variant styling to the confirm button */}
          <AlertDialogAction
            onClick={onConfirm}
             className={Button({ variant: "destructive" }).className} // Apply button variant class
           >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```
  </change>
  <change>
    <file>src/components/dashboard-header.tsx</file>
    <description>Remove component as header logic is now integrated into src/app/(app)/layout.tsx.</description>
    <content><![CDATA[