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
               <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Purchase Date</FormLabel>
                        <DatePicker
                            value={field.value ?? undefined}
                            onSelect={field.onChange} // Pass the onChange handler
                        />
                        <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="warrantyEnd"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Warranty End Date</FormLabel>
                        <DatePicker
                            value={field.value ?? undefined}
                            onSelect={field.onChange}
                        />
                        <FormMessage />
                    </FormItem>
                )}
                />

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
