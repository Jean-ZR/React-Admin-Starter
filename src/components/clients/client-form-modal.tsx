
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
import { Loader2, Search, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Added Alert components

const APIPERU_TOKEN = process.env.NEXT_PUBLIC_APIPERU_TOKEN;

const clientSchema = z.object({
  name: z.string().min(2, { message: "Client name must be at least 2 characters." }),
  contact: z.string().min(2, { message: "Contact name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  phone: z.string()
    .regex(/^\d{9}$/, { message: "Phone number must be 9 digits." })
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
  status: z.string().min(1, { message: "Please select a status." }),
  dataAiHint: z.string().optional(),
  documentType: z.enum(["ruc", "dni", "none"], { required_error: "Debe seleccionar un tipo de documento."}).default("none"),
  documentNumber: z.string().optional(),
})
.refine(data => {
    if (data.documentType === "ruc") {
        return !!data.documentNumber && data.documentNumber.length === 11;
    }
    return true;
}, {
    message: "RUC debe tener 11 dígitos.",
    path: ["documentNumber"],
})
.refine(data => {
    if (data.documentType === "dni") {
        return !!data.documentNumber && data.documentNumber.length === 8;
    }
    return true;
}, {
    message: "DNI debe tener 8 dígitos.",
    path: ["documentNumber"],
})
.refine(data => {
    if (data.documentType !== "none" && (!data.documentNumber || data.documentNumber.trim() === "")) {
        return false; 
    }
    return true;
}, {
    message: "El número de documento es obligatorio si se selecciona RUC o DNI.",
    path: ["documentNumber"],
});

export type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => void;
  clientData?: ClientFormData | null; 
}

const statuses = ["Active", "Inactive", "Prospect"];
const documentTypes = [
    { value: "none", label: "Ninguno" },
    { value: "ruc", label: "RUC" },
    { value: "dni", label: "DNI" },
];

export function ClientFormModal({ isOpen, onClose, onSubmit, clientData }: ClientFormModalProps) {
  const { toast } = useToast();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [apiTokenMissing, setApiTokenMissing] = useState(false);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: clientData || {
      name: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
      status: 'Active',
      dataAiHint: 'company client',
      documentType: "none",
      documentNumber: '',
    },
  });

  const watchedDocumentType = form.watch("documentType");
  const watchedDocumentNumber = form.watch("documentNumber");

  useEffect(() => {
    if (!APIPERU_TOKEN || APIPERU_TOKEN.includes("YOUR_") || APIPERU_TOKEN.trim() === "") {
      setApiTokenMissing(true);
      if (isOpen) { // Only show toast if modal is open to avoid spamming
        toast({
          title: "Token APIPeru Faltante",
          description: "La búsqueda de RUC/DNI está deshabilitada. Configure NEXT_PUBLIC_APIPERU_TOKEN en .env.local.",
          variant: "destructive",
          duration: 7000,
        });
      }
    } else {
      setApiTokenMissing(false);
    }
  }, [toast, isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (clientData) {
        form.reset({
          ...clientData,
          documentType: clientData.documentType || "none",
          documentNumber: clientData.documentNumber || '',
          status: clientData.status || "Active",
        });
      } else {
        form.reset({
          name: '', contact: '', email: '', phone: '', address: '', status: 'Active', dataAiHint: 'company client',
          documentType: "none", documentNumber: ''
        });
      }
    }
  }, [clientData, form, isOpen]);

  const handleSearchDocumentApi = async () => {
    if (apiTokenMissing) {
        toast({ title: "Token APIPeru Faltante", description: "La búsqueda está deshabilitada. Configure NEXT_PUBLIC_APIPERU_TOKEN en .env.local.", variant: "destructive"});
        return;
    }
    const docType = form.getValues("documentType");
    const docNumber = form.getValues("documentNumber");

    if (docType === 'none' || !docNumber || 
        (docType === 'ruc' && docNumber.length !== 11) || 
        (docType === 'dni' && docNumber.length !== 8)) {
      toast({ title: "Entrada Inválida", description: `Ingrese un ${docType.toUpperCase()} válido.`, variant: "destructive"});
      return;
    }

    setIsSearchingApi(true);
    try {
      const response = await fetch(`https://apiperu.dev/api/${docType}/${docNumber}`, {
        headers: { 'Authorization': `Bearer ${APIPERU_TOKEN}`, 'Content-Type': 'application/json' }
      });
      const result = await response.json();

      if (result.success && result.data) {
        let nameFromApi = '';
        if (docType === 'ruc') {
          nameFromApi = result.data.nombre_o_razon_social || '';
          form.setValue("address", result.data.direccion_completa || form.getValues("address") || '');
        } else { 
          nameFromApi = `${result.data.nombres || ''} ${result.data.apellido_paterno || ''} ${result.data.apellido_materno || ''}`.trim();
        }
        form.setValue("name", nameFromApi || form.getValues("name"));
        if (!form.getValues("contact") && nameFromApi) { 
            form.setValue("contact", nameFromApi);
        }
        toast({ title: `${docType.toUpperCase()} Encontrado`, description: `Nombre/Razón Social: ${nameFromApi}. Campos actualizados.` });
      } else {
        toast({ title: `Error Buscando ${docType.toUpperCase()}`, description: result.message || "No se pudo encontrar el documento.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error de API", description: `Error al consultar API de ${docType.toUpperCase()}.`, variant: "destructive" });
    } finally {
      setIsSearchingApi(false);
    }
  };

  const handleFormSubmit: SubmitHandler<ClientFormData> = async (data) => {
    setIsSubmittingForm(true);
    const dataToSubmit = {
        ...data,
        documentNumber: data.documentType === 'none' ? '' : data.documentNumber,
        dataAiHint: data.dataAiHint || data.name.toLowerCase().split(' ').slice(0,2).join(' ') || 'company client',
    };
    try {
        onSubmit(dataToSubmit); 
    } catch (error) {
        toast({ title: "Error Guardando", description: "No se pudo guardar el cliente.", variant: "destructive" });
    } finally {
        setIsSubmittingForm(false);
    }
  };
  
  const canSearch = (watchedDocumentType === 'ruc' && watchedDocumentNumber && watchedDocumentNumber.length === 11) ||
                    (watchedDocumentType === 'dni' && watchedDocumentNumber && watchedDocumentNumber.length === 8);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{clientData ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogDescription>
            {clientData ? 'Update the details of the client.' : 'Fill in the details for the new client.'}
          </DialogDescription>
        </DialogHeader>
        {apiTokenMissing && isOpen && ( // Show alert inside the modal if token is missing and modal is open
          <Alert variant="destructive" className="my-4 bg-destructive/10 border-destructive/30 text-destructive">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertTitle>Token de APIPeru no configurado</AlertTitle>
            <AlertDescription>
              La búsqueda de RUC/DNI está deshabilitada. Por favor, configure `NEXT_PUBLIC_APIPERU_TOKEN` en su archivo `.env.local`.
            </AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name / Business Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Alpha Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Alice Johnson" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-x-2 gap-y-4 items-end">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="documentType"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Document Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {documentTypes.map(docType => <SelectItem key={docType.value} value={docType.value}>{docType.label}</SelectItem>)}
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
                            <FormLabel>
                                Document Number 
                                {watchedDocumentType === 'ruc' && ' (11 digits)'}
                                {watchedDocumentType === 'dni' && ' (8 digits)'}
                            </FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="Enter document number" 
                                    {...field} 
                                    value={field.value || ''}
                                    disabled={watchedDocumentType === "none"}
                                    maxLength={watchedDocumentType === "ruc" ? 11 : (watchedDocumentType === "dni" ? 8 : undefined)}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={handleSearchDocumentApi} 
                    disabled={!canSearch || isSearchingApi || apiTokenMissing}
                    className="h-10 w-10 shrink-0" 
                    title="Buscar RUC/DNI con APIPeru"
                >
                    {isSearchingApi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., contact@alpha.com" {...field} value={field.value || ''}/>
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
                    <FormLabel>Phone (9 digits)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g., 987654321" {...field} value={field.value || ''}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map(stat => <SelectItem key={stat} value={stat}>{stat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., 123 Main St, Anytown, USA 12345" {...field} value={field.value || ''} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dataAiHint"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormLabel>AI Hint</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmittingForm || isSearchingApi}>
                {isSubmittingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (clientData ? 'Save Changes' : 'Add Client')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

