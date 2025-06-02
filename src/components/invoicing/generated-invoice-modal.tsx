
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { CheckCircle, Download, Send, FilePlus, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedInvoiceData {
  invoiceNumber: string;
  clientName: string;
  totalAmount: number | null;
  documentType: 'factura' | 'boleta';
}

interface GeneratedInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: GeneratedInvoiceData | null;
  onNewInvoice: () => void;
  onGoToList: () => void;
}

export function GeneratedInvoiceModal({
  isOpen,
  onClose,
  invoiceData,
  onNewInvoice,
  onGoToList,
}: GeneratedInvoiceModalProps) {
  const { toast } = useToast();

  if (!invoiceData) return null;

  const handleDownloadPDF = () => {
    toast({ title: "Función Próxima", description: `La descarga PDF para ${invoiceData.invoiceNumber} se implementará pronto.` });
  };

  const handleSendEmail = () => {
    toast({ title: "Función Próxima", description: `El envío por email para ${invoiceData.invoiceNumber} se implementará pronto.` });
  };

  const handleCreateNew = () => {
    onNewInvoice();
    onClose();
  };

  const handleGoToList = () => {
    onGoToList();
    onClose();
  };

  const documentTypeName = invoiceData.documentType === 'factura' ? 'Factura' : 'Boleta';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader className="items-center text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-3" />
          <DialogTitle className="text-2xl font-semibold text-foreground">¡Comprobante Generado!</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {documentTypeName} Nro. <span className="font-semibold text-primary">{invoiceData.invoiceNumber}</span> para <span className="font-semibold text-primary">{invoiceData.clientName}</span> ha sido creada exitosamente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-6 p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Monto Total:</p>
            <p className="text-3xl font-bold text-foreground">
                S/ {invoiceData.totalAmount?.toFixed(2) || '0.00'}
            </p>
        </div>

        <div className="space-y-3">
            <Button onClick={handleDownloadPDF} variant="outline" className="w-full border-input hover:bg-accent hover:text-accent-foreground">
                <Download className="mr-2 h-4 w-4" /> Descargar PDF
            </Button>
            <Button onClick={handleSendEmail} variant="outline" className="w-full border-input hover:bg-accent hover:text-accent-foreground">
                <Send className="mr-2 h-4 w-4" /> Enviar por Email
            </Button>
        </div>
        
        <DialogFooter className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:justify-center">
          <Button onClick={handleCreateNew} variant="secondary" className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/80">
            <FilePlus className="mr-2 h-4 w-4" /> Crear Nuevo
          </Button>
          <Button onClick={handleGoToList} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
            <List className="mr-2 h-4 w-4" /> Ir a Lista
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
