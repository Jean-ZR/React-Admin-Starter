
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2, CheckCircle, ClipboardList } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase/config';
import {
  collection,
  // addDoc, // Will be used in modal logic
  // doc,    // Will be used in modal logic
  // updateDoc, // Will be used in modal logic
  // deleteDoc, // Will be used for deletion
  query,
  onSnapshot,
  // serverTimestamp, // Will be used in modal logic
  Timestamp,
  orderBy,
  getDocs, // For fetching establishments once
} from 'firebase/firestore';
// import { SeriesFormModal, type SeriesFormData, type Series } from '@/components/settings/series-form-modal'; // Placeholder for now
// import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'; // Placeholder for now
import { format } from 'date-fns';

// Define interfaces based on the planned data model
interface EstablishmentForSelect {
  id: string;
  code: string;
  tradeName: string;
}

export interface Series {
  id: string;
  establishmentId: string;
  establishmentName?: string; // Denormalized for display, fetched separately
  documentType: 'factura' | 'boleta' | 'nota_credito' | 'nota_debito'; // Example types
  seriesNumber: string; // e.g., F001, B001
  currentCorrelative: number;
  isDefault: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Temporary placeholder for SeriesFormData until modal is created
type SeriesFormData = Omit<Series, 'id' | 'createdAt' | 'updatedAt' | 'establishmentName'>;


export default function DocumentSeriesPage() {
  const { user: currentUser, role: currentUserRole, isFirebaseConfigured } = useAuth();
  const { toast } = useToast();

  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [establishments, setEstablishments] = useState<EstablishmentForSelect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // const [isModalOpen, setIsModalOpen] = useState(false); // For SeriesFormModal
  // const [editingSeries, setEditingSeries] = useState<Series | null>(null); // For SeriesFormModal
  
  // const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // For DeleteConfirmationDialog
  // const [seriesToDelete, setSeriesToDelete] = useState<Series | null>(null); // For DeleteConfirmationDialog

  const isAdmin = currentUserRole === 'admin';

  const fetchEstablishments = useCallback(async () => {
    if (!isAdmin || !isFirebaseConfigured) return;
    try {
      const estSnapshot = await getDocs(query(collection(db, 'establishments'), orderBy('code')));
      const estData = estSnapshot.docs.map(doc => ({
        id: doc.id,
        code: doc.data().code,
        tradeName: doc.data().tradeName,
      } as EstablishmentForSelect));
      setEstablishments(estData);
    } catch (error) {
      console.error("Error fetching establishments for series page:", error);
      toast({ title: "Error", description: "No se pudieron cargar los establecimientos de referencia.", variant: "destructive" });
    }
  }, [isAdmin, isFirebaseConfigured, toast]);


  const fetchSeries = useCallback(() => {
    if (!isAdmin || !isFirebaseConfigured) {
      setIsLoading(false);
       if(isAdmin && !isFirebaseConfigured) {
          toast({title: "Servicio No Disponible", description: "La gestión de series no está disponible ya que Firebase no está configurado.", variant: "destructive"});
      } else if (!isAdmin && isFirebaseConfigured) {
          toast({title: "Acceso Denegado", description: "No tienes permiso para ver las series.", variant: "destructive"});
      }
      setSeriesList([]);
      return () => {}; 
    }
    setIsLoading(true);
    const seriesCollectionRef = collection(db, 'documentSeries');
    const q = query(seriesCollectionRef, orderBy('establishmentId'), orderBy('documentType'), orderBy('seriesNumber'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const seriesData = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        const est = establishments.find(e => e.id === data.establishmentId);
        return {
            id: docSnapshot.id,
            ...data,
            establishmentName: est ? `${est.code} - ${est.tradeName}` : data.establishmentId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        } as Series;
      });
      setSeriesList(seriesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching series:", error);
      toast({ title: "Error", description: "No se pudieron cargar las series de comprobantes.", variant: "destructive" });
      setIsLoading(false);
    });

    return unsubscribe;
  }, [isAdmin, isFirebaseConfigured, toast, establishments]); // Add establishments to dependency array

  useEffect(() => {
    fetchEstablishments(); // Fetch establishments first or in parallel
  }, [fetchEstablishments]);
  
  useEffect(() => {
    // Only fetch series if establishments are loaded (or start loading them in parallel)
    // For simplicity, we'll fetch series after establishments are available, or if establishments list is empty
    // This ensures establishmentName can be populated.
    if(establishments.length > 0 || !isLoading) { // Check isLoading to avoid fetching if initial establishment load failed or is pending
        const unsubscribe = fetchSeries();
        return () => unsubscribe();
    }
  }, [fetchSeries, establishments, isLoading]);


  const handleAddSeries = () => {
    if (!isAdmin) return;
    // setEditingSeries(null);
    // setIsModalOpen(true);
    toast({ title: "Próximamente", description: "El formulario para añadir series estará disponible pronto."});
  };

  const handleEditSeries = (series: Series) => {
    if (!isAdmin) return;
    // setEditingSeries(series);
    // setIsModalOpen(true);
    toast({ title: "Próximamente", description: `El formulario para editar la serie ${series.seriesNumber} estará disponible pronto.`});
  };

  const handleDeleteClick = (series: Series) => {
    if (!isAdmin) return;
    // setSeriesToDelete(series);
    // setIsDeleteDialogOpen(true);
    toast({ title: "Próximamente", description: `La eliminación de la serie ${series.seriesNumber} estará disponible pronto.`});
  };

  // const confirmDeleteSeries = async () => { /* ... */ }; // Placeholder
  // const handleSaveSeries = async (data: SeriesFormData, id?: string) => { /* ... */ }; // Placeholder

  if (!isFirebaseConfigured && isAdmin) {
    return (
         <Card className="bg-card text-card-foreground border-border">
            <CardHeader>
                <CardTitle className="text-foreground">Servicio No Disponible</CardTitle>
                <CardDescription className="text-muted-foreground">
                La gestión de series no está disponible ya que Firebase no está configurado correctamente.
                Por favor, verifica tu archivo <code>.env.local</code>.
                </CardDescription>
            </CardHeader>
        </Card>
    );
  }

  if (!isAdmin && isFirebaseConfigured) {
    return (
        <Card className="bg-card text-card-foreground border-border">
            <CardHeader>
                <CardTitle className="text-foreground">Acceso Denegado</CardTitle>
                <CardDescription className="text-muted-foreground">
                No tienes los permisos necesarios para gestionar series de comprobantes.
                </CardDescription>
            </CardHeader>
        </Card>
    );
  }

  const getDocumentTypeLabel = (docType: Series['documentType']): string => {
    switch (docType) {
      case 'factura': return 'Factura Electrónica';
      case 'boleta': return 'Boleta de Venta Electrónica';
      case 'nota_credito': return 'Nota de Crédito Electrónica';
      case 'nota_debito': return 'Nota de Débito Electrónica';
      default: return docType;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Title handled by AppLayout */}
        <div className="flex-1"></div> {/* Spacer */}
        <Button size="sm" className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddSeries} disabled={!isAdmin || isLoading}>
          <PlusCircle className="h-3.5 w-3.5" />
          Añadir Serie
        </Button>
      </div>

      <Card className="bg-card text-card-foreground border-border shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground">Lista de Series de Comprobantes</CardTitle>
          <CardDescription className="text-muted-foreground">Administra las series de numeración para tus documentos por establecimiento.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Cargando series...</p>
            </div>
          ) : seriesList.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No hay series registradas. Haz clic en "Añadir Serie" para empezar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption className="py-4 text-muted-foreground">Total de series: {seriesList.length}</TableCaption>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Establecimiento</TableHead>
                    <TableHead className="text-muted-foreground">Tipo Documento</TableHead>
                    <TableHead className="text-muted-foreground">Nº Serie</TableHead>
                    <TableHead className="text-center text-muted-foreground">Correlativo Actual</TableHead>
                    <TableHead className="text-center text-muted-foreground">Por Defecto</TableHead>
                    <TableHead className="text-right text-muted-foreground">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seriesList.map((serie) => (
                    <TableRow key={serie.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">{serie.establishmentName}</TableCell>
                      <TableCell className="text-muted-foreground">{getDocumentTypeLabel(serie.documentType)}</TableCell>
                      <TableCell className="font-mono text-xs text-primary">{serie.seriesNumber}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{serie.currentCorrelative}</TableCell>
                      <TableCell className="text-center">
                        {serie.isDefault ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <ClipboardList className="h-5 w-5 text-muted-foreground/50 mx-auto" />}
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
                            <DropdownMenuItem onClick={() => handleEditSeries(serie)} className="cursor-pointer hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(serie)}
                              className="text-destructive focus:text-destructive cursor-pointer hover:!bg-destructive/10 hover:!text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {seriesList.length > 0 && (
            <CardFooter className="border-t border-border pt-4">
                <div className="text-xs text-muted-foreground">
                Mostrando <strong>{seriesList.length}</strong> serie(s).
                </div>
            </CardFooter>
        )}
      </Card>

      {/* 
      <SeriesFormModal
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false);
            setEditingSeries(null);
        }}
        onSubmit={handleSaveSeries}
        seriesData={editingSeries}
        establishments={establishments} // Pass establishments to the modal
      />

      {seriesToDelete && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDeleteSeries}
          itemName={`la serie "${seriesToDelete.seriesNumber}" para ${seriesToDelete.documentType}`}
        />
      )}
      */}
    </div>
  );
}
