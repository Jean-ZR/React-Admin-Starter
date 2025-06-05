
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
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, Timestamp, doc, runTransaction, where } from 'firebase/firestore';
import { Loader2, Save, Send, Search, UserPlus, AlertTriangle } from 'lucide-react';
import { QuickClientFormModal, type QuickClientFormData } from '@/components/invoicing/quick-client-form-modal';
import { GeneratedInvoiceModal } from '@/components/invoicing/generated-invoice-modal';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ClientForSelect {
  id: string;
  name: string;
  documentType?: "ruc" | "dni" | "none";
  documentNumber?: string;
}

interface EstablishmentForSelect {
  id: string;
  code: string;
  tradeName: string;
}

interface SeriesForSelect {
  id: string;
  seriesNumber: string; // e.g., "F001"
  documentType: 'factura' | 'boleta' | 'nota_credito' | 'nota_debito' | 'ticket_venta';
  isDefault?: boolean;
}

interface GeneratedInvoiceData {
  invoiceNumber: string;
  clientName: string;
  totalAmount: number | null;
  documentType: 'factura' | 'boleta';
}

const APIPERU_TOKEN = process.env.NEXT_PUBLIC_APIPERU_TOKEN;

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Debes seleccionar un cliente."),
  establishmentId: z.string().min(1, "Debes seleccionar un establecimiento emisor."),
  documentType: z.enum(["factura", "boleta"], { required_error: "Debes seleccionar un tipo de comprobante." }),
  seriesId: z.string().min(1, "Debes seleccionar una serie para el comprobante."),
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
  const { user: currentUser } = useAuth(); 
  const router = useRouter();
  
  const [clients, setClients] = useState<ClientForSelect[]>([]);
  const [establishments, setEstablishments] = useState<EstablishmentForSelect[]>([]);
  const [availableSeries, setAvailableSeries] = useState<SeriesForSelect[]>([]);
  
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingEstablishments, setIsLoadingEstablishments] = useState(true);
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingRuc, setIsSearchingRuc] = useState(false);
  const [isSearchingDni, setIsSearchingDni] = useState(false);
  const [apiTokenMissing, setApiTokenMissing] = useState(false); 
  
  const [isQuickClientModalOpen, setIsQuickClientModalOpen] = useState(false);
  const [quickClientPrefill, setQuickClientPrefill] = useState<Partial<QuickClientFormData> | undefined>(undefined);

  const [isGeneratedModalOpen, setIsGeneratedModalOpen] = useState(false);
  const [generatedInvoiceData, setGeneratedInvoiceData] = useState<GeneratedInvoiceData | null>(null);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: '',
      establishmentId: '',
      documentType: undefined,
      seriesId: '',
      ruc: '',
      dni: '',
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      itemsDescription: '',
      notes: '',
      totalAmount: null,
    },
  });

  const watchedClientId = form.watch("clientId");
  const watchedEstablishmentId = form.watch("establishmentId");
  const watchedDocumentType = form.watch("documentType");
  const rucValue = form.watch("ruc");
  const dniValue = form.watch("dni");

  useEffect(() => {
    if (!APIPERU_TOKEN || APIPERU_TOKEN.includes("YOUR_") || APIPERU_TOKEN.trim() === "") {
      setApiTokenMissing(true);
      toast({
        title: "Configuración APIPeru Requerida",
        description: "El token para APIPeru no está configurado. La búsqueda de RUC/DNI y validación están deshabilitadas.",
        variant: "destructive",
        duration: Infinity, 
      });
    } else {
      setApiTokenMissing(false);
    }
  }, [toast]);

  const fetchClientsCb = useCallback(async () => {
    setIsLoadingClients(true);
    try {
      const clientsQuery = query(collection(db, 'clients'), orderBy('name'));
      const querySnapshot = await getDocs(clientsQuery);
      const fetchedClients = querySnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name as string,
            documentType: (doc.data().documentType || 'none') as "ruc" | "dni" | "none",
            documentNumber: doc.data().documentNumber as string | undefined,
      }));
      setClients(fetchedClients);
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar los clientes.", variant: "destructive" });
    } finally {
      setIsLoadingClients(false);
    }
  }, [toast]);

  const fetchEstablishmentsCb = useCallback(async () => {
    setIsLoadingEstablishments(true);
    try {
      const estQuery = query(collection(db, 'establishments'), orderBy('isMain', 'desc'), orderBy('code'));
      const querySnapshot = await getDocs(estQuery);
      const fetchedEstablishments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        code: doc.data().code as string,
        tradeName: doc.data().tradeName as string,
      }));
      setEstablishments(fetchedEstablishments);
      if (fetchedEstablishments.length > 0) {
        // Pre-select the first one (usually the main one)
        form.setValue('establishmentId', fetchedEstablishments[0].id, { shouldValidate: true });
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar los establecimientos.", variant: "destructive" });
    } finally {
      setIsLoadingEstablishments(false);
    }
  }, [toast, form]);

  useEffect(() => {
    fetchClientsCb();
    fetchEstablishmentsCb();
  }, [fetchClientsCb, fetchEstablishmentsCb]);

  useEffect(() => {
    const selectedClientId = watchedClientId;
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
          // Keep current documentType or let user choose, but clear specific doc numbers
          // form.setValue('documentType', undefined); // Or keep if already set by user
          form.setValue('ruc', '', { shouldValidate: true });
          form.setValue('dni', '', { shouldValidate: true });
        }
      }
    } else { // No client selected
        // Don't clear documentType if it was manually set by user, but clear RUC/DNI
        form.setValue('ruc', '', { shouldValidate: true });
        form.setValue('dni', '', { shouldValidate: true });
    }
  }, [watchedClientId, clients, form]);
  
  useEffect(() => {
    // This effect is for when documentType is changed manually by user or by client selection
    const currentDocType = watchedDocumentType;
    if (currentDocType === 'factura') {
      form.setValue('dni', '', { shouldValidate: true }); // Clear DNI if Factura
    } else if (currentDocType === 'boleta') {
      form.setValue('ruc', '', { shouldValidate: true }); // Clear RUC if Boleta
    }
  }, [watchedDocumentType, form]);


  useEffect(() => {
    const fetchSeriesForEstablishment = async () => {
      if (watchedEstablishmentId && watchedDocumentType) {
        setIsLoadingSeries(true);
        setAvailableSeries([]); // Clear previous series
        form.setValue('seriesId', '', {shouldValidate: true}); // Clear selected series
        try {
          const seriesQuery = query(
            collection(db, 'documentSeries'),
            where('establishmentId', '==', watchedEstablishmentId),
            where('documentType', '==', watchedDocumentType),
            orderBy('isDefault', 'desc'), // Show default first
            orderBy('seriesNumber', 'asc')
          );
          const querySnapshot = await getDocs(seriesQuery);
          const fetchedSeries = querySnapshot.docs.map(doc => doc.data() as SeriesForSelect);
          setAvailableSeries(fetchedSeries);

          if (fetchedSeries.length > 0) {
            const defaultSeries = fetchedSeries.find(s => s.isDefault) || fetchedSeries[0];
            form.setValue('seriesId', defaultSeries.id, { shouldValidate: true });
          } else {
             toast({ title: "Sin Series", description: `No hay series de tipo '${watchedDocumentType}' para este establecimiento.`, variant: "destructive", duration: 5000 });
          }
        } catch (error) {
          toast({ title: "Error Series", description: "No se pudieron cargar las series.", variant: "destructive" });
        } finally {
          setIsLoadingSeries(false);
        }
      } else {
        setAvailableSeries([]);
        form.setValue('seriesId', '', {shouldValidate: true});
      }
    };
    fetchSeriesForEstablishment();
  }, [watchedEstablishmentId, watchedDocumentType, form, toast]);


  const getNextInvoiceNumber = async (seriesDocId: string): Promise<{ fullInvoiceNumber: string, sequence: number, seriesPrefix: string }> => {
    const seriesRef = doc(db, "documentSeries", seriesDocId);
    try {
      const result = await runTransaction(db, async (transaction) => {
        const seriesSnap = await transaction.get(seriesRef);
        if (!seriesSnap.exists()) {
          throw new Error(`Serie con ID ${seriesDocId} no encontrada.`);
        }
        const seriesData = seriesSnap.data();
        const currentLastNumber = seriesData.currentCorrelative || 0;
        const newSequence = currentLastNumber + 1;
        const seriesPrefix = seriesData.seriesNumber; // e.g., "F001"
        
        transaction.update(seriesRef, { currentCorrelative: newSequence, updatedAt: serverTimestamp() });
        
        return { 
            fullInvoiceNumber: `${seriesPrefix}-${padNumber(newSequence, 7)}`, 
            sequence: newSequence,
            seriesPrefix: seriesPrefix
        };
      });
      return result;
    } catch (error) {
        console.error("Error generating invoice number:", error);
        toast({ title: "Error Correlativo", description: "No se pudo generar el número de comprobante.", variant: "destructive"});
        throw error; 
    }
  };


  const handleFormSubmit: SubmitHandler<InvoiceFormData> = async (data, event) => {
    if (apiTokenMissing && (data.documentType === 'factura' || data.documentType === 'boleta')) {
      toast({ title: "Operación Bloqueada", description: "Configure el token de APIPeru.", variant: "destructive", duration: 7000 });
      return;
    }
    setIsSubmitting(true);
    const submitter = (event?.nativeEvent as SubmitEvent)?.submitter?.textContent || "";
    const selectedClient = clients.find(c => c.id === data.clientId);
    const selectedEstablishment = establishments.find(e => e.id === data.establishmentId);
    const selectedSeries = availableSeries.find(s => s.id === data.seriesId);

    if (!selectedClient || !selectedEstablishment || !selectedSeries) {
      toast({ title: "Error de Datos", description: "Cliente, establecimiento o serie no válidos.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    try {
        const { fullInvoiceNumber, sequence, seriesPrefix } = await getNextInvoiceNumber(data.seriesId);

        const invoiceData = {
          invoiceNumber: fullInvoiceNumber,
          sequenceNumber: sequence,
          seriesUsed: seriesPrefix,
          establishmentId: data.establishmentId,
          establishmentInfo: { code: selectedEstablishment.code, tradeName: selectedEstablishment.tradeName }, // Denormalize
          seriesId: data.seriesId,
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
            invoiceNumber: fullInvoiceNumber,
            clientName: selectedClient.name,
            totalAmount: data.totalAmount,
            documentType: data.documentType
        });
        setIsGeneratedModalOpen(true);

    } catch (error) {
      if (!toast.toasts.find(t => t.title === "Error Correlativo")) { // Avoid double toast for correlative error
          toast({ title: "Error", description: "No se pudo guardar el comprobante.", variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchApi = async (type: 'ruc' | 'dni', value: string | undefined) => {
    if (apiTokenMissing) {
        toast({ title: "Token APIPeru Faltante", description: "Configure NEXT_PUBLIC_APIPERU_TOKEN.", variant: "destructive"});
        return;
    }
    if (!value || (type === 'ruc' && value.length !== 11) || (type === 'dni' && value.length !== 8)) {
        toast({ title: "Entrada Inválida", description: `Ingresa un ${type.toUpperCase()} válido.`, variant: "destructive"});
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
            if (type === 'ruc') nameFromApi = apiData.nombre_o_razon_social || 'No encontrado';
            else nameFromApi = `${apiData.nombres || ''} ${apiData.apellido_paterno || ''} ${apiData.apellido_materno || ''}`.trim() || 'No encontrado';
            
            toast({ title: `${type.toUpperCase()} Encontrado`, description: `Nombre: ${nameFromApi}.` });
            const existingClientByDoc = clients.find(c => c.documentNumber === value && c.documentType === type);
            
            if (existingClientByDoc) {
                form.setValue('clientId', existingClientByDoc.id, { shouldValidate: true });
            } else if (nameFromApi !== 'No encontrado') {
                 setQuickClientPrefill({ name: nameFromApi, documentType: type, documentNumber: value });
                 toast({ title: "Cliente No Registrado", description: `'${nameFromApi}' no está en tu lista. Puedes añadirlo.`, variant: "default" });
            }
        } else {
            toast({ title: `Error Buscando ${type.toUpperCase()}`, description: result.message || "No se pudo encontrar.", variant: "destructive" });
            setQuickClientPrefill({ name: '', documentType: type, documentNumber: value }); 
        }
    } catch (error) {
        toast({ title: "Error de API", description: `Error al consultar API de ${type.toUpperCase()}.`, variant: "destructive" });
        setQuickClientPrefill({ name: '', documentType: type, documentNumber: value }); 
    } finally {
        if (type === 'ruc') setIsSearchingRuc(false);
        if (type === 'dni') setIsSearchingDni(false);
    }
  };
  
  const handleAddClientClick = () => {
    if (apiTokenMissing) {
        toast({ title: "Token APIPeru Faltante", description: "Configure NEXT_PUBLIC_APIPERU_TOKEN.", variant: "destructive" });
        return;
    }
    setIsQuickClientModalOpen(true);
  };

  const handleClientCreated = (clientId: string, clientName: string, clientDocType?: "ruc" | "dni" | "none", clientDocNumber?: string) => {
    const newClientEntry: ClientForSelect = {
        id: clientId, name: clientName, documentType: clientDocType || 'none', documentNumber: clientDocNumber
    };
    setClients(prevClients => [...prevClients, newClientEntry].sort((a, b) => a.name.localeCompare(b.name)));
    form.setValue('clientId', clientId, { shouldValidate: true }); 
    setIsQuickClientModalOpen(false);
    setQuickClientPrefill(undefined); 
  };
  
  const handleModalNewInvoice = () => {
    form.reset();
    setAvailableSeries([]); // Reset series dropdown
    setGeneratedInvoiceData(null);
    setIsGeneratedModalOpen(false);
    // Optionally re-select default establishment if any
    if (establishments.length > 0) {
        form.setValue('establishmentId', establishments[0].id, { shouldValidate: true });
    }
  };

  const handleModalGoToList = () => {
    setIsGeneratedModalOpen(false);
    setGeneratedInvoiceData(null);
    router.push('/invoicing/list');
  };

  return (
    <div className="space-y-6">
       {apiTokenMissing && (
         <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 text-destructive">
           <AlertTriangle className="h-5 w-5 text-destructive" />
           <AlertTitle>Token de APIPeru Faltante</AlertTitle>
           <AlertDescription>Funcionalidad limitada. Configure `NEXT_PUBLIC_APIPERU_TOKEN`.</AlertDescription>
         </Alert>
       )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <Card className="bg-card text-card-foreground border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Crear Nuevo Comprobante</CardTitle>
              <CardDescription className="text-muted-foreground">Completa los detalles del comprobante.</CardDescription>
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
                                <SelectValue placeholder={isLoadingClients ? "Cargando..." : "Seleccionar cliente"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-popover text-popover-foreground border-border">
                              {!isLoadingClients && clients.length === 0 && <SelectItem value="no-clients" disabled>No hay clientes</SelectItem>}
                              {clients.map(client => ( <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem> ))}
                            </SelectContent>
                          </Select>
                          <Button type="button" variant="outline" size="icon" onClick={handleAddClientClick} className="shrink-0 border-input" disabled={apiTokenMissing}>
                            <UserPlus className="h-4 w-4" /><span className="sr-only">Añadir Cliente</span>
                          </Button>
                       </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="establishmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Establecimiento Emisor *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoadingEstablishments}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-input">
                            <SelectValue placeholder={isLoadingEstablishments ? "Cargando..." : "Seleccionar establecimiento"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover text-popover-foreground border-border">
                          {!isLoadingEstablishments && establishments.length === 0 && <SelectItem value="no-est" disabled>No hay establecimientos</SelectItem>}
                          {establishments.map(est => ( <SelectItem key={est.id} value={est.id}>{est.code} - {est.tradeName}</SelectItem> ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                 <FormField
                  control={form.control}
                  name="seriesId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serie del Comprobante *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || ''} 
                        disabled={isLoadingSeries || !watchedEstablishmentId || !watchedDocumentType || availableSeries.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background border-input">
                            <SelectValue placeholder={isLoadingSeries ? "Cargando series..." : (availableSeries.length === 0 ? "No hay series disponibles" : "Seleccionar serie")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover text-popover-foreground border-border">
                          {availableSeries.map(series => ( <SelectItem key={series.id} value={series.id}>{series.seriesNumber}</SelectItem> ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {watchedDocumentType === "factura" && (
                <FormField control={form.control} name="ruc" render={({ field }) => (
                    <FormItem>
                      <FormLabel>RUC (11 dígitos) *</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl><Input placeholder="Ingrese RUC" {...field} value={field.value || ''} className="bg-background border-input flex-1" maxLength={11} /></FormControl>
                        <Button type="button" variant="outline" size="icon" onClick={() => handleSearchApi('ruc', rucValue)} disabled={isSearchingRuc || !rucValue || rucValue.length !== 11 || apiTokenMissing} className="border-input">
                          {isSearchingRuc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}<span className="sr-only">Buscar RUC</span>
                        </Button>
                      </div><FormMessage />
                    </FormItem>)}
                />
              )}
              {watchedDocumentType === "boleta" && (
                <FormField control={form.control} name="dni" render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI (8 dígitos) *</FormLabel>
                       <div className="flex items-center gap-2">
                          <FormControl><Input placeholder="Ingrese DNI" {...field} value={field.value || ''} className="bg-background border-input flex-1" maxLength={8} /></FormControl>
                          <Button type="button" variant="outline" size="icon" onClick={() => handleSearchApi('dni', dniValue)} disabled={isSearchingDni || !dniValue || dniValue.length !== 8 || apiTokenMissing} className="border-input">
                            {isSearchingDni ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}<span className="sr-only">Buscar DNI</span>
                          </Button>
                       </div><FormMessage />
                    </FormItem>)}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="issueDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Emisión *</FormLabel>
                      <DatePicker value={field.value} onSelect={field.onChange} className="bg-background border-input" />
                      <FormMessage />
                    </FormItem>)}
                />
                <FormField control={form.control} name="dueDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Vencimiento *</FormLabel>
                      <DatePicker value={field.value} onSelect={field.onChange} className="bg-background border-input" />
                      <FormMessage />
                    </FormItem>)}
                />
              </div>
              <FormField control={form.control} name="itemsDescription" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción de Ítems/Servicios *</FormLabel>
                    <FormControl><Textarea placeholder="Detalle de los productos o servicios..." {...field} rows={4} className="bg-background border-input" /></FormControl>
                    <FormMessage />
                  </FormItem>)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Adicionales</FormLabel>
                      <FormControl><Textarea placeholder="Términos de pago, etc." {...field} value={field.value || ''} rows={3} className="bg-background border-input"/></FormControl>
                      <FormMessage />
                    </FormItem>)}
                />
                <FormField control={form.control} name="totalAmount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto Total (S/) *</FormLabel>
                      <FormControl><Input type="number" placeholder="0.00" step="0.01" {...field} value={field.value === null || field.value === undefined ? '' : String(field.value)} onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))} className="bg-background border-input" /></FormControl>
                      <FormMessage />
                    </FormItem>)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-border pt-6">
              <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting || isSearchingRuc || isSearchingDni || (apiTokenMissing && (watchedDocumentType === "factura" || watchedDocumentType === "boleta"))} className="border-input">Limpiar</Button>
              <Button type="submit" variant="secondary" name="saveDraft" disabled={isSubmitting || isLoadingSeries || isSearchingRuc || isSearchingDni || (apiTokenMissing && (watchedDocumentType === "factura" || watchedDocumentType === "boleta"))}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Guardar Borrador
              </Button>
              <Button type="submit" name="generateAndSend" disabled={isSubmitting || isLoadingSeries || isSearchingRuc || isSearchingDni || (apiTokenMissing && (watchedDocumentType === "factura" || watchedDocumentType === "boleta"))}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Generar y Enviar
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      <QuickClientFormModal isOpen={isQuickClientModalOpen} onClose={() => { setIsQuickClientModalOpen(false); setQuickClientPrefill(undefined); }} onClientCreated={handleClientCreated} prefillData={quickClientPrefill} />
      {generatedInvoiceData && (
        <GeneratedInvoiceModal isOpen={isGeneratedModalOpen} onClose={() => { setIsGeneratedModalOpen(false); setGeneratedInvoiceData(null);}} invoiceData={generatedInvoiceData} onNewInvoice={handleModalNewInvoice} onGoToList={handleModalGoToList} />
      )}
    </div>
  );
}
    
