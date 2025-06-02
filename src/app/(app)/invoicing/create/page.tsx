
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
import { Loader2, Save, Send, Search, UserPlus } from 'lucide-react';

interface ClientForSelect {
  id: string;
  name: string;
}

// Read the API token from environment variables
const APIPERU_TOKEN = process.env.NEXT_PUBLIC_APIPERU_TOKEN;

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
  const [isSearchingRuc, setIsSearchingRuc] = useState(false);
  const [isSearchingDni, setIsSearchingDni] = useState(false);
  const [apiTokenMissing, setApiTokenMissing] = useState(false);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: '',
      documentType: undefined,
      ruc: '',
      dni: '',
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      itemsDescription: '',
      notes: '',
      totalAmount: null,
    },
  });

  const documentType = form.watch("documentType");
  const rucValue = form.watch("ruc");
  const dniValue = form.watch("dni");

  useEffect(() => {
    if (!APIPERU_TOKEN || APIPERU_TOKEN === 'YOUR_APIPERU_TOKEN_HERE') {
      setApiTokenMissing(true);
      toast({
        title: "Configuración Requerida",
        description: "El token para APIPeru no está configurado en las variables de entorno. La búsqueda de RUC/DNI está deshabilitada.",
        variant: "destructive",
        duration: 7000,
      });
    }
  }, []);

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
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Factura (Borrador) Creada",
      description: `Se ha generado un borrador para el cliente. Tipo: ${data.documentType}.`,
    });
    setIsSubmitting(false);
  };

  const handleSearchApi = async (type: 'ruc' | 'dni', value: string | undefined) => {
    if (apiTokenMissing) {
        toast({
            title: "Token Requerido",
            description: "Por favor, configura tu token de APIPeru en las variables de entorno para usar esta función.",
            variant: "destructive",
        });
        return;
    }
    if (!value || (type === 'ruc' && value.length !== 11) || (type === 'dni' && value.length !== 8)) {
        toast({
            title: "Entrada Inválida",
            description: `Por favor, ingresa un ${type.toUpperCase()} válido (${type === 'ruc' ? '11' : '8'} dígitos).`,
            variant: "destructive",
        });
        return;
    }

    if (type === 'ruc') setIsSearchingRuc(true);
    if (type === 'dni') setIsSearchingDni(true);

    try {
        const response = await fetch(`https://apiperu.dev/api/${type}/${value}`, {
            headers: {
                'Authorization': `Bearer ${APIPERU_TOKEN}`,
                'Content-Type': 'application/json',
            }
        });
        const result = await response.json();

        if (result.success) {
            const data = result.data;
            let nameFromApi = '';
            let addressFromApi = '';

            if (type === 'ruc') {
                nameFromApi = data.nombre_o_razon_social || 'No encontrado';
                addressFromApi = data.direccion_completa || '';
                toast({ title: "RUC Encontrado", description: `Nombre: ${nameFromApi}. Dirección: ${addressFromApi || 'N/A'}` });
            } else { // dni
                nameFromApi = `${data.nombres || ''} ${data.apellido_paterno || ''} ${data.apellido_materno || ''}`.trim();
                nameFromApi = nameFromApi || 'No encontrado';
                toast({ title: "DNI Encontrado", description: `Nombre: ${nameFromApi}.` });
            }
            console.log(`API ${type.toUpperCase()} Data:`, data);

            // Attempt to auto-select client if name matches and no client is selected
            const currentClientId = form.getValues('clientId');
            if (!currentClientId && nameFromApi !== 'No encontrado') {
                const existingClient = clients.find(c => c.name.toLowerCase() === nameFromApi.toLowerCase());
                if (existingClient) {
                    form.setValue('clientId', existingClient.id);
                    toast({ title: "Cliente Encontrado", description: `Cliente '${nameFromApi}' seleccionado automáticamente.`, variant: "default" });
                }
            }

        } else {
            toast({ title: `Error Buscando ${type.toUpperCase()}`, description: result.message || "No se pudo encontrar el documento.", variant: "destructive" });
        }
    } catch (error) {
        console.error(`Error searching ${type}:`, error);
        toast({ title: "Error de API", description: `Ocurrió un error al consultar la API de ${type.toUpperCase()}.`, variant: "destructive" });
    } finally {
        if (type === 'ruc') setIsSearchingRuc(false);
        if (type === 'dni') setIsSearchingDni(false);
    }
  };
  
  const handleAddClientClick = () => {
    // TODO: Implement modal for quick client creation
    toast({ title: "Próximamente", description: "Funcionalidad para añadir cliente rápido estará disponible pronto." });
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
                       <div className="flex items-center gap-2">
                          <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingClients}>
                            <FormControl>
                              <SelectTrigger className="bg-background border-input flex-1">
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
                          <Button type="button" variant="outline" size="icon" onClick={handleAddClientClick} className="shrink-0">
                            <UserPlus className="h-4 w-4" />
                            <span className="sr-only">Añadir Nuevo Cliente</span>
                          </Button>
                       </div>
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
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input placeholder="Ingrese RUC del cliente" {...field} value={field.value || ''} className="bg-background border-input flex-1" maxLength={11} />
                        </FormControl>
                        <Button type="button" variant="outline" size="icon" onClick={() => handleSearchApi('ruc', rucValue)} disabled={isSearchingRuc || !rucValue || rucValue.length !== 11 || apiTokenMissing}>
                          {isSearchingRuc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                           <span className="sr-only">Buscar RUC</span>
                        </Button>
                      </div>
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
                       <div className="flex items-center gap-2">
                          <FormControl>
                            <Input placeholder="Ingrese DNI del cliente" {...field} value={field.value || ''} className="bg-background border-input flex-1" maxLength={8} />
                          </FormControl>
                          <Button type="button" variant="outline" size="icon" onClick={() => handleSearchApi('dni', dniValue)} disabled={isSearchingDni || !dniValue || dniValue.length !== 8 || apiTokenMissing}>
                            {isSearchingDni ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                             <span className="sr-only">Buscar DNI</span>
                          </Button>
                       </div>
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
               {apiTokenMissing && (
                <p className="text-sm text-destructive text-center col-span-full">
                  La búsqueda de RUC/DNI está deshabilitada. Configure el token APIPERU_TOKEN en sus variables de entorno.
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-border pt-6">
              <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting || isSearchingRuc || isSearchingDni}>
                Limpiar Formulario
              </Button>
              <Button type="submit" variant="secondary" disabled={isSubmitting || isSearchingRuc || isSearchingDni || apiTokenMissing}>
                {isSubmitting || isSearchingRuc || isSearchingDni ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar Borrador
              </Button>
              <Button type="submit" disabled={isSubmitting || isSearchingRuc || isSearchingDni || apiTokenMissing} onClick={() => console.log("Simulating Generate & Send")}>
                {isSubmitting || isSearchingRuc || isSearchingDni ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Generar y Enviar
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}

