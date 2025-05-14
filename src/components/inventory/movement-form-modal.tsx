
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
import type { Timestamp } from 'firebase/firestore';

// Define Zod schema for validation
const movementSchema = z.object({
  itemId: z.string().min(1, { message: "Please select an item." }),
  type: z.string().min(1, { message: "Please select a movement type." }),
  quantity: z.number().min(0.01, { message: "Quantity must be greater than 0." }), // Quantity change itself is always positive; type dictates effect
  sourceOrDestination: z.string().optional(),
  notes: z.string().optional(),
  // Fields that are part of the document but not typically edited in this form:
  // itemName: z.string().optional(), // Usually derived or stored for display convenience
  // itemSku: z.string().optional(),
  // user: z.string().optional(),
  // createdAt: z.custom<Timestamp>().optional()
});

export type MovementFormData = z.infer<typeof movementSchema>;

interface InventoryItemBasic {
  id: string;
  name: string;
  sku: string;
}

interface MovementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MovementFormData) => Promise<void>;
  movementData?: (MovementFormData & { id?: string; itemName?: string; itemSku?: string; }) | null; // Data for editing
  inventoryItems: InventoryItemBasic[]; // List of items for the dropdown
}

const movementTypes = ["Inbound", "Outbound", "Adjustment", "Transfer"];

export function MovementFormModal({ isOpen, onClose, onSubmit, movementData, inventoryItems }: MovementFormModalProps) {
  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      itemId: '',
      type: '',
      quantity: 1,
      sourceOrDestination: '',
      notes: '',
    },
  });

  const isEditing = !!movementData;

  useEffect(() => {
    if (isOpen) {
      if (isEditing && movementData) {
        form.reset({
          ...movementData,
          quantity: Math.abs(movementData.quantity), // Ensure quantity is positive for the form
        });
      } else {
        form.reset({
          itemId: '',
          type: '',
          quantity: 1,
          sourceOrDestination: '',
          notes: '',
        });
      }
    }
  }, [isOpen, movementData, isEditing, form]);

  const handleFormSubmit: SubmitHandler<MovementFormData> = async (data) => {
    // The actual positive/negative quantity adjustment logic should happen
    // where this movement affects stock levels (e.g., in a transaction or cloud function).
    // For logging, we store the quantity as entered, and 'type' indicates its effect.
    // If an 'Adjustment' could be negative (e.g. correcting an overcount), the schema might need to allow negative numbers.
    // For now, we assume quantity means "amount of items moved".
    await onSubmit(data);
    // Parent component will handle closing the modal on successful submission.
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Stock Movement' : 'Record New Stock Movement'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of this stock movement.' : 'Log a new inventory movement.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="itemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inventory Item *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                    disabled={isEditing} // Typically, you don't change the item of an existing movement log
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {inventoryItems.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.sku} - {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Movement Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {movementTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 10"
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        min="0.01"
                        step="any"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sourceOrDestination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source / Destination</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Supplier X, Client B, Warehouse A" {...field} value={field.value || ''}/>
                  </FormControl>
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
                    <Textarea placeholder="Additional details about the movement..." {...field} value={field.value || ''} rows={3} />
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
                {form.formState.isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Record Movement')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
