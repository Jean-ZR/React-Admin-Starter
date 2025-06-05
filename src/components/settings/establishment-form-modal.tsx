
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

// Define Zod schema for validation
const establishmentSchema = z.object({
  code: z.string().length(4, { message: "El código debe tener exactamente 4 dígitos." }).regex(/^\d{4}$/, "El código solo debe contener números."),
  tradeName: z.string().min(3, { message: "El nombre comercial debe tener al menos 3 caracteres." }),
  address: z.string().min(5, { message: "La dirección debe tener al menos 5 caracteres." }),
  district: z.string().min(3, { message: "El distrito debe tener al menos 3 caracteres." }),
  province: z.string().min(3, { message: "La provincia debe tener al menos 3 caracteres." }),
  department: z.string().min(3, { message: "El departamento debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Email inválido." }).optional().or(z.literal('')),
  phone: z.string().optional(),
  isMain: z.boolean().default(false),
});

export type EstablishmentFormData = z.infer<typeof establishmentSchema>;

// Interface for establishment data that might include an ID from Firestore
export interface Establishment extends EstablishmentFormData {
  id?: string;
  // Add any other fields that might come from Firestore, like timestamps
  createdAt?: any; 
  updatedAt?: any;
}


interface EstablishmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EstablishmentFormData, id?: string) => Promise<void>; // Modified to pass ID for updates
  establishmentData?: Establishment | null; // Data for editing, now uses Establishment interface
}

export function EstablishmentFormModal({ isOpen, onClose, onSubmit, establishmentData }: EstablishmentFormModalProps) {
  const form = useForm<EstablishmentFormData>({
    resolver: zodResolver(establishmentSchema),
    defaultValues: {
      code: '',
      tradeName: '',
      address: '',
      district: '',
      province: '',
      department: '',
      email: '',
      phone: '',
      isMain: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (establishmentData) {
        form.reset(establishmentData);
      } else {
        form.reset({
          code: '',
          tradeName: '',
          address: '',
          district: '',
          province: '',
          department: '',
          email: '',
          phone: '',
          isMain: false,
        });
      }
    }
  }, [isOpen, establishmentData, form]);

  const handleFormSubmit: SubmitHandler<EstablishmentFormData> = async (data) => {
    // The onSubmit prop now handles if it's an update (with ID) or create
    await onSubmit(data, establishmentData?.id); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-xl font-semibold text-foreground">
            {establishmentData ? 'Editar Establecimiento' : 'Añadir Nuevo Establecimiento'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {establishmentData ? 'Actualiza los detalles del establecimiento.' : 'Completa los detalles para el nuevo establecimiento.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Código Sucursal (SUNAT) *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 0000" {...field} maxLength={4} className="bg-background border-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tradeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Nombre Comercial *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Tienda Principal" {...field} className="bg-background border-input" />
                    </FormControl>
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
                  <FormLabel className="text-muted-foreground">Dirección Fiscal Completa *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Av. El Sol 123, Urb. Miraflores" {...field} rows={2} className="bg-background border-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Departamento *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Lima" {...field} className="bg-background border-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Provincia *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Lima" {...field} className="bg-background border-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Distrito *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Miraflores" {...field} className="bg-background border-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Email de Contacto</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Ej: tienda@ejemplo.com" {...field} value={field.value || ''} className="bg-background border-input" />
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
                    <FormLabel className="text-muted-foreground">Teléfono de Contacto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 01 555 1234" {...field} value={field.value || ''} className="bg-background border-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isMain"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-input p-3 shadow-sm bg-background mt-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-foreground">Establecimiento Principal</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Marcar si este es el establecimiento principal de la empresa.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="pt-6 border-t border-border">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-input hover:bg-accent hover:text-accent-foreground">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (establishmentData ? 'Guardar Cambios' : 'Añadir Establecimiento')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
