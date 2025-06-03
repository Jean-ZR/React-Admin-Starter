
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
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, Timestamp, doc, runTransaction } from 'firebase/firestore';
import { Loader2, Save, Send, Search, UserPlus } from 'lucide-react';
import { QuickClientFormModal, type QuickClientFormData } from '@/components/invoicing/quick-client-form-modal';
import { GeneratedInvoiceModal } from '@/components/invoicing/generated-invoice-modal';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

interface ClientForSelect {
  id: string;
  name: string;
  documentType?: "ruc" | "dni" | "none";
  documentNumber?: string;
}

interface GeneratedInvoiceData {
  invoiceNumber: string;
  clientName: string;
  totalAmount: number | null;
  documentType: 'factura' | 'boleta';
}

// const APIPERU_TOKEN = process.env.NEXT_PUBLIC_APIPERU_TOKEN; // Replaced by context

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

const padNumber = (num: number, size: number): string => {
  let s = num.toString();
  while (s.length < size) s = "0" + s;
  return s;
};

export default function CreateInvoicePage() {
  const { toast } = useToast();
  const { user: currentUser, apiPeruConfig } = useAuth(); // Use apiPeruConfig from context
  const router = useRouter();
  const [clients, setClients] = useState<ClientForSelect[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingRuc, setIsSearchingRuc] = useState(false);
  const [isSearchingDni, setIsSearchingDni] = useState(false);
  // const [apiTokenMissing, setApiTokenMissing] = useState(false); // Replaced by apiPeruConfig check
  const [isQuickClientModalOpen, setIsQuickClientModalOpen] = useState(false);
  const [quickClientPrefill, setQuickClientPrefill] = useState<Partial<QuickClientFormData> | undefined>(undefined);

  const [isGeneratedModalOpen, setIsGeneratedModalOpen] = useState(false);
  const [generatedInvoiceData, setGeneratedInvoiceData] = useState<GeneratedInvoiceData | null>(null);

  const APIPERU_TOKEN = apiPeruConfig?.apiToken; // Get token from context
  const apiTokenMissing = !APIPERU_TOKEN;


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

  const documentTypeFormValue = form.watch("documentType");
  const rucValue = form.watch("ruc");
  const dniValue = form.watch("dni");

 useEffect(() => {
    if (!apiPeruConfig?.apiToken && apiPeruConfig !== null) { // Check if config is loaded but token is missing
      toast({
        title: "Configuración Requerida",
        description: "El token para APIPeru no está configurado en el sistema. La búsqueda de RUC/DNI y la creación de clientes están deshabilitadas. Por favor, configure el token en Ajustes > Integraciones.",
        variant: "destructive",
        duration: Infinity,
      });
    }
  }, [apiPeruConfig, toast]);

  const fetchClients = useCallback(async () => {
    setIsLoadingClients(true);
    try {
      const clientsQuery = query(collection(db, 'clients'), orderBy('name'));
      const querySnapshot = await getDocs(clientsQuery);
      const fetchedClients = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name as string,
            documentType: (data.documentType || 'none') as "ruc" | "dni" | "none",
            documentNumber: data.documentNumber as string | undefined,
        };
      });
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

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type !== 'change') return;

      if (name === 'clientId') {
        const selectedClientId = value.clientId;
        if (selectedClientId) {
          const client = clients.find(c => c.id === selectedClientId);
          if (client) {
            if (client.documentType === 'ruc' && client.documentNumber) {
              form.setValue('documentType', 'factura', { shouldValidate: true });
              form.setValue('ruc', client.documentNumber, { shouldValidate: true });
              form.setValue('dni', '', { shouldValidate: true });
            } else if (client.documentType === 'dni' && client.documentNumber) {
              form.setValue('documentType', 'boleta', { shouldValidate: true });
              form.setValue('dni', client.documentNumber, { shouldValidate: true });
              form.setValue('ruc', '', { shouldValidate: true });
            } else { 
              form.setValue('documentType', undefined, { shouldValidate: true });
              form.setValue('ruc', '', { shouldValidate: true });
              form.setValue('dni', '', { shouldValidate: true });
            }
          }
        } else { 
          form.setValue('documentType', undefined, { shouldValidate: true });
          form.setValue('ruc', '', { shouldValidate: true });
          form.setValue('dni', '', { shouldValidate: true });
        }
      } else if (name === 'documentType') {
        const newDocumentType = value.documentType;
        if (newDocumentType === 'factura') {
          form.setValue('dni', '', { shouldValidate: true });
        } else if (newDocumentType === 'boleta') {
          form.setValue('ruc', '', { shouldValidate: true });
        } else { 
          form.setValue('ruc', '', { shouldValidate: true });
          form.setValue('dni', '', { shouldValidate: true });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, clients]);


  const getNextInvoiceNumber = async (docType: 'factura' | 'boleta'): Promise<{ fullNumber: string, sequence: number }> => {
    const seriesPrefix = docType === 'factura' ? 'F001' : 'B001';
    const counterRef = doc(db, "invoiceSeriesCounters", seriesPrefix);

    try {
      const newSequenceNumber = await runTransaction(db, async (transaction) => {
        const counterSnap = await transaction.get(counterRef);
        let currentLastNumber = 0;
        if (counterSnap.exists()) {
          currentLastNumber = counterSnap.data()?.lastNumber || 0;
        }
        const newNumber = currentLastNumber + 1;
        transaction.set(counterRef, { lastNumber: newNumber }, { merge: true });
        return newNumber;
      });
      return {
        fullNumber: `${seriesPrefix}-${padNumber(newSequenceNumber, 7)}`,
        sequence: newSequenceNumber,
      };
    } catch (error) {
        console.error("Error generating invoice number:", error);
        toast({ title: "Error Correlativo", description: "No se pudo generar el número de comprobante.", variant: "destructive"});
        throw error; 
    }
  };


  const handleFormSubmit: SubmitHandler<InvoiceFormData> = async (data, event) => {
    if (apiTokenMissing && (data.documentType === 'factura' || data.documentType === 'boleta')) {
      toast({ title: "Operación Bloqueada", description: "No se pueden crear comprobantes con RUC/DNI hasta que se configure el token de APIPeru en Ajustes > Integraciones.", variant: "destructive", duration: 7000 });
      return;
    }
    setIsSubmitting(true);
    const submitter = (event?.nativeEvent as SubmitEvent)?.submitter?.textContent || "";

    const selectedClient = clients.find(c => c.id === data.clientId);

    if (!selectedClient) {
      toast({ title: "Error", description: "Cliente no encontrado.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    try {
        const { fullNumber: invoiceNumber, sequence: sequenceNumber } = await getNextInvoiceNumber(data.documentType);

        const invoiceData = {
        invoiceNumber,
        sequenceNumber,
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        clientDocumentType: selectedClient.documentType || 'none',
        clientDocumentNumber: data.documentType === 'factura' ? data.ruc : (data.documentType === 'boleta' ? data.dni : ''),
        documentType: data.documentType,
        issueDate: Timestamp.fromDate(data.issueDate),
        dueDate: Timestamp.fromDate(data.dueDate),
        itemsDescription: data.itemsDescription,
        notes: data.notes || '',
        totalAmount: data.totalAmount,
        status: submitter.includes("Enviar") ? 'Enviada' : 'Borrador',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: currentUser?.uid || null,
        };

        await addDoc(collection(db, 'invoices'), invoiceData);
        
        setGeneratedInvoiceData({
            invoiceNumber: invoiceNumber,
            clientName: selectedClient.name,
            totalAmount: data.totalAmount,
            documentType: data.documentType
        });
        setIsGeneratedModalOpen(true);

    } catch (error) {
      if (!toast.toasts.find(t => t.title === "Error Correlativo")) {
          toast({ title: "Error", description: "No se pudo guardar el comprobante.", variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchApi = async (type: 'ruc' | 'dni', value: string | undefined) => {
    if (apiTokenMissing) {
        toast({ title: "Token Requerido", description: "Configure el token de APIPeru en Ajustes > Integraciones.", variant: "destructive"});
        return;
    }
    if (!value || (type === 'ruc' && value.length !== 11) || (type === 'dni' && value.length !== 8)) {
        toast({ title: "Entrada Inválida", description: `Ingresa un ${type.toUpperCase()} válido de ${type === 'ruc' ? 11 : 8} dígitos.`, variant: "destructive"});
        return;
    }

    if (type === 'ruc') setIsSearchingRuc(true);
    if (type === 'dni') setIsSearchingDni(true);
    setQuickClientPrefill(undefined); 

    try {
        const response = await fetch(`https://apiperu.dev/api/${type}/${value}`, {
            headers: { 'Authorization': `Bearer ${APIPERU_TOKEN}`, 'Content-Type': 'application/json'}
        });
        const result = await response.json();

        if (result.success) {
            const apiData = result.data;
            let nameFromApi = '';
            
            if (type === 'ruc') {
                nameFromApi = apiData.nombre_o_razon_social || 'No encontrado';
            } else { 
                nameFromApi = `${apiData.nombres || ''} ${apiData.apellido_paterno || ''} ${apiData.apellido_materno || ''}`.trim() || 'No encontrado';
            }
            
            toast({ title: `${type.toUpperCase()} Encontrado`, description: `Nombre: ${nameFromApi}.` });

            const existingClientByName = clients.find(c => c.name.toLowerCase() === nameFromApi.toLowerCase());
            const existingClientByDoc = clients.find(c => c.documentNumber === value && c.documentType === type);
            
            if (existingClientByDoc) {
                form.setValue('clientId', existingClientByDoc.id, { shouldValidate: true });
                toast({ title: "Cliente Existente", description: `Cliente '${nameFromApi}' seleccionado por número de documento.`, variant: "default" });
            } else if (existingClientByName && !form.getValues('clientId')) {
                form.setValue('clientId', existingClientByName.id, { shouldValidate: true });
                 toast({ title: "Cliente Existente", description: `Cliente '${nameFromApi}' seleccionado por nombre.`, variant: "default" });
            } else if (nameFromApi !== 'No encontrado') {
                 setQuickClientPrefill({ name: nameFromApi, documentType: type, documentNumber: value });
                 toast({ title: "Cliente No Registrado", description: `'${nameFromApi}' no está en tu lista. Puedes añadirlo rápidamente con el botón [+].`, variant: "default" });
            }

        } else {
            toast({ title: `Error Buscando ${type.toUpperCase()}`, description: result.message || "No se pudo encontrar. Puedes añadirlo manualmente.", variant: "destructive" });
            setQuickClientPrefill({ name: '', documentType: type, documentNumber: value }); 
        }
    } catch (error) {
        toast({ title: "Error de API", description: `Error al consultar API de ${type.toUpperCase()}. Verifica tu conexión o el token.`, variant: "destructive" });
        setQuickClientPrefill({ name: '', documentType: type, documentNumber: value }); 
    } finally {
        if (type === 'ruc') setIsSearchingRuc(false);
        if (type === 'dni') setIsSearchingDni(false);
    }
  };
  
  const handleAddClientClick = () => {
    if (apiTokenMissing) {
        toast({ title: "Token Requerido", description: "La creación de clientes está deshabilitada hasta que se configure el token de APIPeru en Ajustes > Integraciones.", variant: "destructive" });
        return;
    }
    setIsQuickClientModalOpen(true);
  };

  const handleClientCreated = (clientId: string, clientName: string, clientDocType?: "ruc" | "dni" | "none", clientDocNumber?: string) => {
    const newClientEntry: ClientForSelect = {
        id: clientId,
        name: clientName,
        documentType: clientDocType || 'none',
        documentNumber: clientDocNumber
    };
    
    setClients(prevClients => [...prevClients, newClientEntry].sort((a, b) => a.name.localeCompare(b.name)));
    
    form.setValue('clientId', clientId, { shouldValidate: true }); 

    if (clientDocType === 'ruc' && clientDocNumber && documentTypeFormValue === 'factura') {
        form.setValue('ruc', clientDocNumber, {shouldValidate: true});
    } else if (clientDocType === 'dni' && clientDocNumber && documentTypeFormValue === 'boleta') {
        form.setValue('dni', clientDocNumber, {shouldValidate: true});
    }

    setIsQuickClientModalOpen(false);
    setQuickClientPrefill(undefined); 
  };
  
  const handleModalNewInvoice = () => {
    form.reset();
    setGeneratedInvoiceData(null);
    setIsGeneratedModalOpen(false);
  };

  const handleModalGoToList = () => {
    setIsGeneratedModalOpen(false);
    setGeneratedInvoiceData(null);
    router.push('/invoicing/list');
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <Card className="bg-card text-card-foreground border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Crear Nuevo Comprobante</CardTitle>
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
                          <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoadingClients}>
                            <FormControl>
                              <SelectTrigger className="bg-background border-input flex-1">
                                <SelectValue placeholder={isLoadingClients ? "Cargando clientes..." : "Seleccionar cliente"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-popover text-popover-foreground border-border">
                              {!isLoadingClients && clients.length === 0 && <SelectItem value="no-clients" disabled>No hay clientes</SelectItem>}
                              {clients.map(client => (
                                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button type="button" variant="outline" size="icon" onClick={handleAddClientClick} className="shrink-0 border-input hover:bg-accent hover:text-accent-foreground" disabled={apiTokenMissing}>
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
                      <Select onValueChange={field.onChange} value={field.value || ''}>
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

              {documentTypeFormValue === "factura" && (
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
                        <Button type="button" variant="outline" size="icon" onClick={() => handleSearchApi('ruc', rucValue)} disabled={isSearchingRuc || !rucValue || rucValue.length !== 11 || apiTokenMissing} className="border-input hover:bg-accent hover:text-accent-foreground">
                          {isSearchingRuc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                           <span className="sr-only">Buscar RUC</span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {documentTypeFormValue === "boleta" && (
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
                          <Button type="button" variant="outline" size="icon" onClick={() => handleSearchApi('dni', dniValue)} disabled={isSearchingDni || !dniValue || dniValue.length !== 8 || apiTokenMissing} className="border-input hover:bg-accent hover:text-accent-foreground">
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
                      <FormLabel>Monto Total (S/) *</FormLabel>
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
              <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting || isSearchingRuc || isSearchingDni || (apiTokenMissing && (documentTypeFormValue === "factura" || documentTypeFormValue === "boleta"))} className="border-input hover:bg-accent hover:text-accent-foreground">
                Limpiar Formulario
              </Button>
              <Button type="submit" variant="secondary" disabled={isSubmitting || isSearchingRuc || isSearchingDni || (apiTokenMissing && (documentTypeFormValue === "factura" || documentTypeFormValue === "boleta"))}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar Borrador
              </Button>
              <Button type="submit" disabled={isSubmitting || isSearchingRuc || isSearchingDni || (apiTokenMissing && (documentTypeFormValue === "factura" || documentTypeFormValue === "boleta"))}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Generar y Enviar
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      <QuickClientFormModal
        isOpen={isQuickClientModalOpen}
        onClose={() => {
            setIsQuickClientModalOpen(false);
            setQuickClientPrefill(undefined);
        }}
        onClientCreated={handleClientCreated}
        prefillData={quickClientPrefill}
      />
      {generatedInvoiceData && (
        <GeneratedInvoiceModal
            isOpen={isGeneratedModalOpen}
            onClose={() => {
                setIsGeneratedModalOpen(false);
                setGeneratedInvoiceData(null);
            }}
            invoiceData={generatedInvoiceData}
            onNewInvoice={handleModalNewInvoice}
            onGoToList={handleModalGoToList}
        />
      )}
    </div>
  );
}
    

    

