
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, Search, MoreHorizontal, Eye, Edit, DollarSign, Send, Trash2, FileDown, Download, Loader2 } from "lucide-react";
import { InvoiceStatusBadge } from '@/components/invoicing/invoice-status-badge';
import { useAuth } from '@/contexts/auth-context';
import { getPageTitleInfo } from '@/lib/translations';
import { usePathname } from 'next/navigation';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, onSnapshot, Timestamp, doc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  issueDate: Timestamp;
  dueDate: Timestamp;
  totalAmount: number;
  status: 'Borrador' | 'Enviada' | 'Pagada' | 'Vencida' | 'Cancelada';
  documentType: 'factura' | 'boleta';
  // Add other fields as necessary
}

export default function InvoiceListPage() {
  const { languagePreference } = useAuth();
  const pathname = usePathname();
  const { toast } = useToast();
  const currentPageInfo = getPageTitleInfo(languagePreference, pathname);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


  useEffect(() => {
    setIsLoading(true);
    const invoicesCollectionRef = collection(db, 'invoices');
    const q = query(invoicesCollectionRef, orderBy('issueDate', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedInvoices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Invoice));
      setInvoices(fetchedInvoices);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching invoices: ", error);
      toast({ title: "Error", description: "No se pudieron cargar las facturas.", variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDF = (invoiceId: string) => {
    toast({ title: "Función Próxima", description: `La descarga de PDF para ${invoiceId} aún no está implementada.` });
  };
  
  const handleChangeStatus = async (invoiceId: string, newStatus: Invoice['status']) => {
    try {
        const invoiceRef = doc(db, 'invoices', invoiceId);
        await updateDoc(invoiceRef, {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
        toast({title: "Estado Actualizado", description: `Comprobante ${invoiceId} marcado como ${newStatus}.`});
    } catch (error) {
        console.error("Error updating status: ", error);
        toast({title: "Error", description: "No se pudo actualizar el estado del comprobante.", variant: "destructive"});
    }
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteInvoice = async () => {
    if (invoiceToDelete) {
        try {
            await deleteDoc(doc(db, 'invoices', invoiceToDelete.id));
            toast({title: "Comprobante Eliminado", description: `El comprobante ${invoiceToDelete.invoiceNumber} ha sido eliminado.`});
            setInvoiceToDelete(null);
        } catch (error) {
            console.error("Error deleting invoice: ", error);
            toast({title: "Error", description: "No se pudo eliminar el comprobante.", variant: "destructive"});
        }
    }
    setIsDeleteDialogOpen(false);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          {/* Page title and subtitle are now handled by AppLayout using currentPageInfo */}
        </div>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar Nro o Cliente..."
              className="pl-8 sm:w-[200px] md:w-[300px] bg-background border-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button asChild size="sm" className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/invoicing/create">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Crear Comprobante</span>
            </Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-border bg-card text-card-foreground">
        <CardHeader className="border-b border-border">
          <CardTitle>Lista de Comprobantes</CardTitle>
          <CardDescription>Visualiza y gestiona todos tus comprobantes (facturas y boletas).</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Cargando comprobantes...</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>Se encontraron {filteredInvoices.length} comprobantes.</TableCaption>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground"># Comprobante</TableHead>
                  <TableHead className="text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-muted-foreground">Fecha Emisión</TableHead>
                  <TableHead className="text-muted-foreground">Fecha Venc.</TableHead>
                  <TableHead className="text-right text-muted-foreground">Total (S/)</TableHead>
                  <TableHead className="text-center text-muted-foreground">Estado</TableHead>
                  <TableHead className="text-right text-muted-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-muted/50 border-border">
                      <TableCell className="font-mono text-xs text-muted-foreground">{invoice.invoiceNumber}</TableCell>
                      <TableCell className="font-medium text-foreground">{invoice.clientName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {invoice.issueDate ? format(invoice.issueDate.toDate(), 'dd/MM/yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {invoice.dueDate ? format(invoice.dueDate.toDate(), 'dd/MM/yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right text-foreground">{invoice.totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <InvoiceStatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Menú de acciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => toast({title: "Próximamente", description: "Detalle de comprobante aún no implementado."})} className="cursor-pointer hover:!bg-accent hover:!text-accent-foreground">
                              <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                            </DropdownMenuItem>
                             <DropdownMenuItem onSelect={() => handleDownloadPDF(invoice.invoiceNumber)} className="cursor-pointer hover:!bg-accent hover:!text-accent-foreground">
                              <Download className="mr-2 h-4 w-4" /> Descargar PDF
                            </DropdownMenuItem>
                            {invoice.status === 'Borrador' && (
                              <DropdownMenuItem onSelect={() => toast({title: "Próximamente", description:"Edición de comprobante aún no implementada."})} className="cursor-pointer hover:!bg-accent hover:!text-accent-foreground">
                                <Edit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                            )}
                            {invoice.status === 'Borrador' && (
                              <DropdownMenuItem onSelect={() => handleChangeStatus(invoice.id, 'Enviada')} className="cursor-pointer hover:!bg-accent hover:!text-accent-foreground">
                                <Send className="mr-2 h-4 w-4" /> Marcar como Enviada
                              </DropdownMenuItem>
                            )}
                             {(invoice.status === 'Enviada' || invoice.status === 'Vencida') && (
                              <DropdownMenuItem onSelect={() => handleChangeStatus(invoice.id, 'Pagada')} className="cursor-pointer hover:!bg-accent hover:!text-accent-foreground">
                                <DollarSign className="mr-2 h-4 w-4" /> Marcar como Pagada
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-border" />
                             {invoice.status !== 'Cancelada' && invoice.status !== 'Pagada' && (
                              <DropdownMenuItem onSelect={() => handleChangeStatus(invoice.id, 'Cancelada')} className="text-orange-600 focus:text-orange-600 cursor-pointer hover:!bg-orange-100 hover:!text-orange-700 dark:focus:!bg-orange-700/30 dark:hover:!bg-orange-700/30">
                                <Trash2 className="mr-2 h-4 w-4" /> Anular Comprobante
                              </DropdownMenuItem>
                            )}
                             <DropdownMenuItem onSelect={() => handleDeleteClick(invoice)} className="text-destructive focus:text-destructive cursor-pointer hover:!bg-destructive/10 hover:!text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar Registro
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No se encontraron comprobantes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>
      {invoiceToDelete && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDeleteInvoice}
          itemName={`el comprobante ${invoiceToDelete.invoiceNumber}`}
        />
      )}
    </div>
  );
}

    
  

    