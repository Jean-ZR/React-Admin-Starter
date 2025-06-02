
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Loader2, Save, Send } from 'lucide-react';

interface ClientForSelect {
  id: string;
  name: string;
}

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Debes seleccionar un cliente."),
  documentType: z.enum(["factura", "boleta"], { required_error: "Debes seleccionar un tipo de comprobante." }),
  ruc: z.string().optional(),
  dni: z.string().optional(),
  issueDate: z.date({ required_error: "La fecha de emisión es obligatoria." }),
  dueDate: z.date({ required_error: "La fecha de vencimiento es obligatoria." }),
  itemsDescription: z.string().min(1, "Debes añadir una descripción de los ítems.").max(500, "La descripción no puede exceder los 500 caracteres."),
  notes: z.string().optional(),
  totalAmount: z.preprocess(
    (val) => (val === "" || val === undefined || val === null) ? null : Number(val),
    z.number().positive({ message: "El monto total debe ser un número positivo." }).nullable()
  ),
})
.refine(data => {
    if (data.documentType === "factura") {
        return !!data.ruc && data.ruc.length === 11;
    }
    return true;
}, {
    message: "El RUC es obligatorio para Factura y debe tener 11 dígitos.",
    path: ["ruc"],
})
.refine(data => {
    if (data.documentType === "boleta") {
        return !!data.dni && data.dni.length === 8;
    }
    return true;
}, {
    message: "El DNI es obligatorio para Boleta y debe tener 8 dígitos.",
    path: ["dni"],
})
.refine(data => data.dueDate >= data.issueDate, {
    message: "La fecha de vencimiento no puede ser anterior a la fecha de emisión.",
    path: ["dueDate"],
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function CreateInvoicePage() {
  const { toast } = useToast();
  const [clients, setClients] = useState<ClientForSelect[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: '',
      documentType: undefined,
      ruc: '',
      dni: '',
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default due date 30 days from now
      itemsDescription: '',
      notes: '',
      totalAmount: null,
    },
  });

  const documentType = form.watch("documentType");

  const fetchClients = useCallback(async () => {
    setIsLoadingClients(true);
    try {
      const clientsQuery = query(collection(db, 'clients'), orderBy('name'));
      const querySnapshot = await getDocs(clientsQuery);
      const fetchedClients = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name as string,
      }));
      setClients(fetchedClients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({ title: "Error", description: "No se pudieron cargar los clientes.", variant: "destructive" });
    } finally {
      setIsLoadingClients(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleFormSubmit: SubmitHandler<InvoiceFormData> = async (data) => {
    setIsSubmitting(true);
    console.log("Invoice Data:", data);
    // TODO: Implement actual saving to Firestore
    // For now, just simulate a delay and show a success toast
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Factura (Borrador) Creada",
      description: `Se ha generado un borrador para el cliente. Tipo: ${data.documentType}.`,
    });
    // form.reset(); // Optionally reset form after submission
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <Card className="bg-card text-card-foreground border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Crear Nueva Factura</CardTitle>
              <CardDescription className="text-muted-foreground">
                Completa los detalles para generar una nueva factura o boleta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingClients}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-input">
                            <SelectValue placeholder={isLoadingClients ? "Cargando clientes..." : "Seleccionar cliente"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover text-popover-foreground border-border">
                          {!isLoadingClients && clients.length === 0 && <SelectItem value="no-clients" disabled>No hay clientes disponibles</SelectItem>}
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
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
                      <FormLabel>Tipo de Comprobante *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-input">
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover text-popover-foreground border-border">
                          <SelectItem value="factura">Factura</SelectItem>
                          <SelectItem value="boleta">Boleta</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {documentType === "factura" && (
                <FormField
                  control={form.control}
                  name="ruc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RUC (11 dígitos) *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese RUC del cliente" {...field} value={field.value || ''} className="bg-background border-input" maxLength={11} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {documentType === "boleta" && (
                <FormField
                  control={form.control}
                  name="dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI (8 dígitos) *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese DNI del cliente" {...field} value={field.value || ''} className="bg-background border-input" maxLength={8} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Emisión *</FormLabel>
                      <DatePicker value={field.value} onSelect={field.onChange} className="bg-background border-input" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Vencimiento *</FormLabel>
                      <DatePicker value={field.value} onSelect={field.onChange} className="bg-background border-input" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="itemsDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción de Ítems/Servicios *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detalle de los productos o servicios facturados. Ej:&#10;- Servicio de consultoría (10 horas)&#10;- Licencia de Software (Anual)"
                        {...field}
                        rows={4}
                        className="bg-background border-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Adicionales</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Términos de pago, información bancaria, etc." {...field} value={field.value || ''} rows={3} className="bg-background border-input"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto Total *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          {...field}
                          value={field.value === null || field.value === undefined ? '' : String(field.value)}
                          onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                          className="bg-background border-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-border pt-6">
              <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting}>
                Limpiar Formulario
              </Button>
              <Button type="submit" variant="secondary" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar Borrador
              </Button>
              <Button type="submit" disabled={isSubmitting} onClick={() => console.log("Simulating Generate & Send")}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Generar y Enviar
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}

    