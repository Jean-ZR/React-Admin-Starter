
'use client';

import React, { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

// Zod schema for inventory item validation
const itemSchema = z.object({
  name: z.string().min(2, { message: "Item name must be at least 2 characters." }),
  sku: z.string().min(1, { message: "SKU is required." }),
  category: z.string().min(1, { message: "Please select or enter a category." }),
  quantity: z.preprocess(
    (val) => (val === "" || val === undefined || val === null) ? 0 : Number(val),
    z.number().min(0, { message: "Quantity cannot be negative." }).default(0)
  ),
  reorderLevel: z.preprocess(
    (val) => (val === "" || val === undefined || val === null) ? 0 : Number(val),
    z.number().min(0, { message: "Reorder level cannot be negative." }).default(0)
  ),
  cost: z.preprocess(
    (val) => (val === "" || val === undefined || val === null) ? null : Number(val),
    z.number().positive({ message: "Cost must be a positive number." }).nullable().optional()
  ),
  location: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
  dataAiHint: z.string().optional(),
});

export type ItemFormData = z.infer<typeof itemSchema>;

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ItemFormData) => Promise<void>;
  itemData?: (ItemFormData & { id?: string }) | null;
  availableCategories?: string[]; // For category dropdown and creation
}

export function ItemFormModal({ isOpen, onClose, onSubmit, itemData, availableCategories = [] }: ItemFormModalProps) {
  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: '',
      quantity: 0,
      reorderLevel: 0,
      cost: null,
      location: '',
      description: '',
      image: '',
      dataAiHint: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (itemData) {
        form.reset({
          ...itemData,
          cost: itemData.cost !== undefined && itemData.cost !== null ? Number(itemData.cost) : null,
          quantity: itemData.quantity !== undefined ? Number(itemData.quantity) : 0,
          reorderLevel: itemData.reorderLevel !== undefined ? Number(itemData.reorderLevel) : 0,
          image: itemData.image || '',
          dataAiHint: itemData.dataAiHint || '',
        });
      } else {
        form.reset({
          name: '', sku: '', category: '', quantity: 0, reorderLevel: 0,
          cost: null, location: '', description: '', image: '', dataAiHint: '',
        });
      }
    }
  }, [itemData, form, isOpen]);

  const handleFormSubmit: SubmitHandler<ItemFormData> = async (data) => {
    const processedData = {
        ...data,
        cost: data.cost === undefined || data.cost === null || isNaN(Number(data.cost)) ? null : Number(data.cost),
        quantity: Number(data.quantity),
        reorderLevel: Number(data.reorderLevel),
        image: data.image || `https://placehold.co/600x400.png`,
        dataAiHint: data.dataAiHint || data.name.toLowerCase().split(' ').slice(0,2).join(' ') || 'inventory item'
    };
    await onSubmit(processedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{itemData ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
          <DialogDescription>
            {itemData ? 'Update the details of this inventory item.' : 'Fill in the details for the new inventory item.'}
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
                    <FormLabel>Item Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Wireless Mouse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU (Stock Keeping Unit) *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., WM-LOGI-M185" {...field} />
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
                    <FormControl>
                      <Input 
                        placeholder="e.g., Peripherals, Office Supplies" 
                        {...field} 
                        list="category-suggestions"
                      />
                    </FormControl>
                    {availableCategories && availableCategories.length > 0 && (
                      <datalist id="category-suggestions">
                        {availableCategories.map(cat => <option key={cat} value={cat} />)}
                      </datalist>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity on Hand *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50" {...field} 
                       value={field.value === undefined || field.value === null ? '' : String(field.value)}
                       onChange={e => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                       min="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reorderLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Level *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 10" {...field}
                       value={field.value === undefined || field.value === null ? '' : String(field.value)}
                       onChange={e => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                       min="0"
                      />
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
                    <FormLabel>Cost Per Item ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 25.99"
                        step="0.01"
                        {...field}
                        value={field.value === undefined || field.value === null ? '' : String(field.value)}
                        onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                      />
                    </FormControl>
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
                      <Input placeholder="e.g., Shelf A1, Warehouse 2" {...field} value={field.value || ''} />
                    </FormControl>
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
            </div>
             <FormField
                control={form.control}
                name="dataAiHint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image Search Hint</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., wireless mouse" {...field} value={field.value || ''} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Max 2 keywords for image placeholder search.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes about the item..." {...field} value={field.value || ''} rows={3} />
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
                {form.formState.isSubmitting ? 'Saving...' : (itemData ? 'Save Changes' : 'Add Item')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

