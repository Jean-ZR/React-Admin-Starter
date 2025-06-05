
'use client';

import React, { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import type { Timestamp } from 'firebase/firestore';

export interface EstablishmentForSelect {
  id: string;
  code: string;
  tradeName: string;
}

// Zod schema for series validation
// Series number format: F001 (letter + 3 digits) or B001, or T001 (Ticket)
// For Notas de Crédito/Débito, it can be F C01 or B C01 (Factura/Boleta + C/D + number)
// A more flexible regex for series: ^[FBTEV][A-Z0-9]{0,3}[0-9]{1,3}$ (Allows F001, B001, T001, FC01, BD01 etc. up to 4 chars)
// For simplicity for now, we'll use a simpler validation.
const seriesSchema = z.object({
  establishmentId: z.string().min(1, "Debes seleccionar un establecimiento."),
  documentType: z.enum(["factura", "boleta", "nota_credito", "nota_debito", "ticket_venta"], { 
    required_error: "Debes seleccionar un tipo de documento." 
  }),
  seriesNumber: z.string()
    .min(4, "El número de serie debe tener 4 caracteres (ej. F001, B001).")
    .max(4, "El número de serie debe tener 4 caracteres (ej. F001, B001).")
    .regex(/^[FBTEV][0-9]{3}$/, "Formato inválido. Ej: F001, B001, T001, E001, V001."),
  currentCorrelative: z.preprocess(
    (val) => (val === "" || val === undefined || val === null) ? 0 : Number(val),
    z.number().int().min(0, "El correlativo no puede ser negativo.").default(0)
  ),
  isDefault: z.boolean().default(false),
});

export type SeriesFormData = z.infer<typeof seriesSchema>;

export interface Series extends SeriesFormData {
  id?: string; // Optional for new series
  establishmentName?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface SeriesFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SeriesFormData, id?: string) => Promise<void>;
  seriesData?: Series | null;
  establishments: EstablishmentForSelect[];
}

const documentTypeOptions = [
  { value: "factura", label: "Factura Electrónica" },
  { value: "boleta", label: "Boleta de Venta Electrónica" },
  { value: "nota_credito", label: "Nota de Crédito Electrónica" },
  { value: "nota_debito", label: "Nota de Débito Electrónica" },
  { value: "ticket_venta", label: "Ticket de Venta (Interno)" },
];

export function SeriesFormModal({ isOpen, onClose, onSubmit, seriesData, establishments }: SeriesFormModalProps) {
  const form = useForm<SeriesFormData>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      establishmentId: '',
      documentType: undefined, 
      seriesNumber: '',
      currentCorrelative: 0,
      isDefault: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (seriesData) {
        form.reset({
            ...seriesData,
            currentCorrelative: seriesData.currentCorrelative || 0, // Ensure number
        });
      } else {
        form.reset({
          establishmentId: '',
          documentType: undefined,
          seriesNumber: '',
          currentCorrelative: 0,
          isDefault: false,
        });
      }
    }
  }, [isOpen, seriesData, form]);

  const handleFormSubmit: SubmitHandler<SeriesFormData> = async (data) => {
    await onSubmit(data, seriesData?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-xl font-semibold text-foreground">
            {seriesData ? 'Editar Serie de Comprobante' : 'Añadir Nueva Serie'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {seriesData ? 'Actualiza los detalles de la serie.' : 'Completa los detalles para la nueva serie de comprobantes.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-3">
            <FormField
              control={form.control}
              name="establishmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Establecimiento *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder="Seleccionar establecimiento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover text-popover-foreground border-border">
                      {establishments.length === 0 && <SelectItem value="no-est" disabled>No hay establecimientos</SelectItem>}
                      {establishments.map(est => (
                        <SelectItem key={est.id} value={est.id}>
                          {est.code} - {est.tradeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Tipo de Comprobante *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder="Seleccionar tipo de documento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover text-popover-foreground border-border">
                      {documentTypeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="seriesNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Número de Serie *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: F001, B001" {...field} maxLength={4} className="uppercase bg-background border-input" />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Debe ser 1 letra (F, B, T, E, V) seguida de 3 números.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentCorrelative"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Correlativo Actual *</FormLabel>
                  <FormControl>
                    <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        value={field.value}
                        onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                        min="0"
                        className="bg-background border-input" 
                        disabled={!!seriesData} // Disable if editing, correlative managed by system
                    />
                  </FormControl>
                   {!!seriesData && <p className="text-xs text-muted-foreground">El correlativo se actualiza automáticamente por el sistema.</p>}
                   {!seriesData && <p className="text-xs text-muted-foreground">Para nuevas series, usualmente inicia en 0.</p>}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-input p-3 shadow-sm bg-background mt-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-foreground">Serie por Defecto</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Marcar si esta es la serie predeterminada para este tipo de documento y establecimiento.
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
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (seriesData ? 'Guardar Cambios' : 'Añadir Serie')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    