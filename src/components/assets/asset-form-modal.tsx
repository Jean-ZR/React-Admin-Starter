
'use client';

import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Keep Label if used outside Form context, FormLabel preferred within
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

// Define Zod schema for validation
const assetSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  status: z.string().min(1, { message: "Please select a status." }),
  location: z.string().optional(),
  assignedTo: z.string().optional(),
  serialNumber: z.string().optional(),
  cost: z.union([z.string().regex(/^\d*(\.\d{1,2})?$/, "Must be a valid monetary value or empty").optional().nullable(), z.number().positive({ message: "Cost must be a positive number." }).optional().nullable()])
    .transform(val => (val === "" || val === undefined || val === null) ? null : Number(val))
    .nullable()
    .optional(),
  purchaseDate: z.date().optional().nullable(),
  warrantyEnd: z.date().optional().nullable(),
  description: z.string().optional(),
  image: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
  dataAiHint: z.string().optional(),
});

export type AssetFormData = z.infer<typeof assetSchema>;

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssetFormData) => Promise<void>; // Made onSubmit async
  assetData?: (AssetFormData & { id?: string; purchaseDate?: any; warrantyEnd?: any; cost?: any }) | null; // Data for editing, allow flexible input types for dates/cost
  availableCategories?: Array<{ id: string; name: string }>; // For category dropdown
}

// Example data for selects (replace with fetched data if needed)
const statuses = ["Active", "Inactive", "In Repair", "Disposed", "Maintenance"];

export function AssetFormModal({ isOpen, onClose, onSubmit, assetData, availableCategories = [] }: AssetFormModalProps) {
  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: '',
      category: '',
      status: '',
      location: '',
      assignedTo: '',
      serialNumber: '',
      cost: null,
      purchaseDate: null,
      warrantyEnd: null,
      description: '',
      image: '',
      dataAiHint: '',
    },
  });

   // Reset form when assetData changes or modal opens/closes
    useEffect(() => {
        if (isOpen && assetData) {
        form.reset({
            ...assetData,
            cost: assetData.cost !== undefined && assetData.cost !== null ? Number(assetData.cost) : null,
            purchaseDate: assetData.purchaseDate ? (assetData.purchaseDate.toDate ? assetData.purchaseDate.toDate() : new Date(assetData.purchaseDate)) : null,
            warrantyEnd: assetData.warrantyEnd ? (assetData.warrantyEnd.toDate ? assetData.warrantyEnd.toDate() : new Date(assetData.warrantyEnd)) : null,
            image: assetData.image || '',
            dataAiHint: assetData.dataAiHint || '',
        });
        } else if (isOpen && !assetData) {
        form.reset({
            name: '', category: '', status: '', location: '', assignedTo: '',
            serialNumber: '', cost: null, purchaseDate: null, warrantyEnd: null, description: '', image: '', dataAiHint: '',
        });
        }
    }, [assetData, form, isOpen]);


  const handleFormSubmit: SubmitHandler<AssetFormData> = async (data) => {
     const processedData = {
        ...data,
        cost: data.cost === undefined || data.cost === null || isNaN(Number(data.cost)) ? null : Number(data.cost),
        image: data.image || `https://placehold.co/600x400.png`, // Default placeholder if empty
        dataAiHint: data.dataAiHint || data.name.split(" ").slice(0,2).join(" ").toLowerCase() || 'asset item'
    };
    await onSubmit(processedData);
    // No explicit onClose here, parent handles it on successful submission
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
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
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
                     <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                         <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                         </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {availableCategories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
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
                      <Input placeholder="e.g., Office A, Storage" {...field} value={field.value || ''} />
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
                      <Input placeholder="e.g., John Doe / Unassigned" {...field} value={field.value || ''} />
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
                      <Input placeholder="e.g., SN12345XYZ" {...field} value={field.value || ''} />
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
                       <Input
                        type="number"
                        placeholder="e.g., 1200.00"
                        step="0.01"
                        {...field}
                        value={field.value === undefined || field.value === null ? '' : field.value}
                        onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Purchase Date</FormLabel>
                        <DatePicker
                            value={field.value ?? undefined}
                            onSelect={field.onChange}
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
                 <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                        <Input placeholder="https://placehold.co/600x400.png" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="dataAiHint"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Image Search Hint</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g. laptop computer" {...field} value={field.value || ''} />
                        </FormControl>
                         <p className="text-xs text-muted-foreground">Max 2 keywords for image placeholder search.</p>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes about the asset..." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <DialogFooter className="pt-4">
               <DialogClose asChild>
                 <Button type="button" variant="outline">Cancel</Button>
               </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : (assetData ? 'Save Changes' : 'Add Asset')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
