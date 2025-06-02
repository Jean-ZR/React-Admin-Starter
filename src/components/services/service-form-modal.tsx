
'use client';

import React, { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

// Define Zod schema for validation
const serviceSchema = z.object({
  name: z.string().min(3, { message: "Service name must be at least 3 characters." }),
  category: z.string().min(2, { message: "Category must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  price: z.string().min(1, { message: "Price information is required (e.g., $50/hr, Quote Based)." }),
  sla: z.string().min(3, { message: "SLA must be at least 3 characters (e.g., 4h, NBD)." }),
  isActive: z.boolean().default(true),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  serviceData?: (ServiceFormData & { id?: string }) | null;
}

export function ServiceFormModal({ isOpen, onClose, onSubmit, serviceData }: ServiceFormModalProps) {
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
      price: '',
      sla: '',
      isActive: true,
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      if (serviceData) {
        form.reset({
          ...serviceData,
          isActive: serviceData.isActive !== undefined ? serviceData.isActive : true,
        });
      } else {
        form.reset({
          name: '',
          category: '',
          description: '',
          price: '',
          sla: '',
          isActive: true,
        });
      }
    }
  }, [serviceData, form, isOpen]);

  const handleFormSubmit: SubmitHandler<ServiceFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    //   onClose(); // Parent will close modal on successful submission
    } catch (error) {
      // Error handling can be done in the parent or here with a toast
      console.error("Error submitting service form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{serviceData ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          <DialogDescription>
            {serviceData ? 'Update the details of this service.' : 'Fill in the details for the new service.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Standard IT Support" {...field} />
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
                    <Input placeholder="e.g., Support, Installation, Consulting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detailed description of the service offered..." {...field} rows={4}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., $50/hr, $250 fixed, Quote Based" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sla"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SLA (Service Level Agreement) *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 4 hours response, NBD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                  <div className="space-y-0.5">
                    <FormLabel>Service Active</FormLabel>
                    <FormDescription className="text-xs">
                      Inactive services will not be available for selection.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {serviceData ? 'Save Changes' : 'Add Service'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
