
'use client';

import React, { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

const quickClientSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  documentType: z.enum(["ruc", "dni", "none"], { errorMap: () => ({ message: "Selecciona un tipo de documento o 'Ninguno'."}) }).default("none"),
  documentNumber: z.string().optional(),
  email: z.string().email("Email inválido.").optional().or(z.literal('')),
  phone: z.string().regex(/^\d{9}$/, "El teléfono debe tener 9 dígitos.").optional().or(z.literal('')),
}).refine(data => {
    if (data.documentType === "ruc") return !!data.documentNumber && data.documentNumber.length === 11;
    return true;
}, { message: "RUC debe tener 11 dígitos.", path: ["documentNumber"] })
.refine(data => {
    if (data.documentType === "dni") return !!data.documentNumber && data.documentNumber.length === 8;
    return true;
}, { message: "DNI debe tener 8 dígitos.", path: ["documentNumber"] });

export type QuickClientFormData = z.infer<typeof quickClientSchema>;

interface QuickClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (clientId: string, clientName: string) => void;
  prefillData?: Partial<QuickClientFormData>;
}

export function QuickClientFormModal({ isOpen, onClose, onClientCreated, prefillData }: QuickClientFormModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<QuickClientFormData>({
    resolver: zodResolver(quickClientSchema),
    defaultValues: {
      name: prefillData?.name || '',
      documentType: prefillData?.documentType || "none",
      documentNumber: prefillData?.documentNumber || '',
      email: prefillData?.email || '',
      phone: prefillData?.phone || '',
    },
  });

  const docType = form.watch("documentType");

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: prefillData?.name || '',
        documentType: prefillData?.documentType || 'none',
        documentNumber: prefillData?.documentNumber || '',
        email: prefillData?.email || '',
        phone: prefillData?.phone || '',
      });
    }
  }, [isOpen, prefillData, form]);

  const handleFormSubmit: SubmitHandler<QuickClientFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const clientDataToSave = {
        name: data.name,
        contact: data.name, // Using name as contact for simplicity in quick add
        email: data.email || '',
        phone: data.phone || '',
        address: '', // Default empty address
        status: 'Active', // Default status
        documentType: data.documentType,
        documentNumber: data.documentNumber || '',
        dataAiHint: data.name.toLowerCase().split(' ').slice(0,2).join(' ') || 'company client',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'clients'), clientDataToSave);
      toast({ title: "Cliente Creado", description: `${data.name} ha sido añadido exitosamente.` });
      onClientCreated(docRef.id, data.name);
      onClose();
    } catch (error) {
      console.error("Error creating client:", error);
      toast({ title: "Error", description: "No se pudo crear el cliente.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Cliente Rápido</DialogTitle>
          <DialogDescription>
            Ingresa los detalles básicos del nuevo cliente. Podrás añadir más información después.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre / Razón Social *</FormLabel>
                  <FormControl><Input placeholder="Ej: Empresa XYZ S.A.C." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tipo Documento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger className="bg-background border-input">
                            <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover text-popover-foreground border-border">
                        <SelectItem value="none">Ninguno</SelectItem>
                        <SelectItem value="ruc">RUC</SelectItem>
                        <SelectItem value="dni">DNI</SelectItem>
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
                        <FormLabel>Nº Documento {docType === 'ruc' ? '(11 dígitos)' : docType === 'dni' ? '(8 dígitos)' : ''}</FormLabel>
                        <FormControl><Input placeholder="Ingrese número" {...field} value={field.value || ''} disabled={docType === 'none'} maxLength={docType === 'ruc' ? 11 : docType === 'dni' ? 8 : undefined} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="cliente@ejemplo.com" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono (9 dígitos)</FormLabel>
                  <FormControl><Input type="tel" placeholder="987654321" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Cliente
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
