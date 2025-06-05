
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
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  orderBy,
  getDocs,
  writeBatch,
  where,
} from 'firebase/firestore';
import { SeriesFormModal, type SeriesFormData, type Series, type EstablishmentForSelect } from '@/components/settings/series-form-modal';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';

export default function DocumentSeriesPage() {
  const { user: currentUser, role: currentUserRole, isFirebaseConfigured } = useAuth();
  const { toast } = useToast();

  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [establishments, setEstablishments] = useState<EstablishmentForSelect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<Series | null>(null);

  const isAdmin = currentUserRole === 'admin';

  const fetchEstablishments = useCallback(async () => {
    if (!isAdmin || !isFirebaseConfigured) {
      setEstablishments([]);
      // setIsLoading(false); // isLoading will be handled by series fetch logic primarily
      return;
    }
    // setIsLoading(true); // Let initial state handle this, or series fetch can set initial true
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
      setEstablishments([]);
    } 
    // setIsLoading(false); // Series fetch will handle overall loading state if needed
  }, [isAdmin, isFirebaseConfigured, toast]);

  useEffect(() => {
    fetchEstablishments();
  }, [fetchEstablishments]);
  
  const fetchSeries = useCallback(() => {
    if (!isAdmin || !isFirebaseConfigured) {
      setIsLoading(false);
      setSeriesList([]);
      return () => {}; 
    }
    // Only proceed if establishments might be available or if it's the initial load.
    // The establishments dependency in the useEffect below will ensure this runs when establishments are ready.
    
    setIsLoading(true); // Set loading for series fetching.
    const seriesCollectionRef = collection(db, 'documentSeries');
    const q = query(seriesCollectionRef, orderBy('establishmentId'), orderBy('documentType'), orderBy('seriesNumber'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const seriesData = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        // Use the `establishments` state variable here for mapping names
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
  }, [isAdmin, isFirebaseConfigured, toast, establishments]); // `establishments` is a key dependency here
  
  useEffect(() => {
    // This effect fetches series. It runs when `fetchSeries` function instance changes.
    // `fetchSeries` changes when its dependencies (`isAdmin`, `isFirebaseConfigured`, `toast`, `establishments`) change.
    // The most frequent meaningful change here will be `establishments`.
    if (isAdmin && isFirebaseConfigured) {
      // If establishments are not yet loaded, fetchSeries might still run but could internally wait or handle empty establishments.
      // Or, we can add a check: if (establishments.length > 0 || initialLoad) { ... }
      // For now, relying on fetchSeries being robust or establishments being populated.
      const unsubscribe = fetchSeries();
      return () => unsubscribe();
    } else {
      // Conditions not met for fetching (e.g., not admin), ensure loading is false and list is empty.
      setIsLoading(false);
      setSeriesList([]);
    }
  }, [fetchSeries, isAdmin, isFirebaseConfigured]); // Removed `establishments` and `isLoading` from here as fetchSeries depends on establishments

  const handleAddSeries = () => {
    if (!isAdmin) return;
    if (establishments.length === 0) {
        toast({title: "Acción Requerida", description: "Por favor, añade al menos un establecimiento antes de crear series.", variant: "destructive"});
        return;
    }
    setEditingSeries(null);
    setIsModalOpen(true);
  };

  const handleEditSeries = (series: Series) => {
    if (!isAdmin) return;
    setEditingSeries(series);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (series: Series) => {
    if (!isAdmin) return;
    setSeriesToDelete(series);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSeries = async () => {
    if (!isAdmin || !seriesToDelete || !seriesToDelete.id) return;
    try {
      await deleteDoc(doc(db, 'documentSeries', seriesToDelete.id));
      toast({ title: "Éxito", description: `Serie "${seriesToDelete.seriesNumber}" eliminada.` });
    } catch (error) {
      console.error("Error deleting series:", error);
      toast({ title: "Error", description: "No se pudo eliminar la serie.", variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setSeriesToDelete(null);
    }
  };

  const handleSaveSeries = async (data: SeriesFormData, id?: string) => {
    if (!isAdmin || !isFirebaseConfigured) {
        toast({ title: "Operación Fallida", description: "No se puede guardar la serie.", variant: "destructive"});
        return;
    }
    
    const batch = writeBatch(db);

    try {
      if (data.isDefault) {
        const q = query(
            collection(db, "documentSeries"), 
            where("establishmentId", "==", data.establishmentId),
            where("documentType", "==", data.documentType),
            where("isDefault", "==", true)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
          if (docSnap.id !== id) { 
            batch.update(doc(db, "documentSeries", docSnap.id), { isDefault: false });
          }
        });
      }
      
      if (id) { 
        const seriesDocRef = doc(db, 'documentSeries', id);
        batch.update(seriesDocRef, { ...data, updatedAt: serverTimestamp() });
        await batch.commit();
        toast({ title: "Éxito", description: "Serie actualizada." });
      } else { 
        const newSeriesRef = doc(collection(db, 'documentSeries')); 
        batch.set(newSeriesRef, { ...data, currentCorrelative: data.currentCorrelative || 0, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        await batch.commit();
        toast({ title: "Éxito", description: "Nueva serie añadida." });
      }
      setIsModalOpen(false);
      setEditingSeries(null);
    } catch (error) {
      console.error("Error saving series:", error);
      toast({ title: "Error", description: "No se pudo guardar la serie.", variant: "destructive" });
    }
  };

  if (!isFirebaseConfigured && isAdmin) {
    return (
         <Card className="bg-card text-card-foreground border-border">
            <CardHeader>
                <CardTitle className="text-foreground">Servicio No Disponible</CardTitle>
                <CardDescription className="text-muted-foreground">
                La gestión de series no está disponible ya que Firebase no está configurado correctamente.
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
      case 'ticket_venta': return 'Ticket de Venta (Interno)';
      default: return docType;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1"></div> 
        <Button size="sm" className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddSeries} disabled={!isAdmin || isLoading || establishments.length === 0}>
          <PlusCircle className="h-3.5 w-3.5" />
          Añadir Serie
        </Button>
      </div>
      {establishments.length === 0 && isAdmin && !isLoading && (
        <Card className="bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700">
            <CardHeader>
                <CardTitle className="text-yellow-700 dark:text-yellow-300">Acción Requerida</CardTitle>
                <CardDescription className="text-yellow-600 dark:text-yellow-400">
                No hay establecimientos registrados. Por favor, añade al menos un establecimiento para poder crear series de comprobantes.
                </CardDescription>
            </CardHeader>
        </Card>
      )}

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
              No hay series registradas. Haz clic en "Añadir Serie" para empezar (asegúrate de tener establecimientos creados).
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

      <SeriesFormModal
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false);
            setEditingSeries(null);
        }}
        onSubmit={handleSaveSeries}
        seriesData={editingSeries}
        establishments={establishments}
      />

      {seriesToDelete && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDeleteSeries}
          itemName={`la serie "${seriesToDelete.seriesNumber}" para ${getDocumentTypeLabel(seriesToDelete.documentType)}`}
        />
      )}
    </div>
  );
}
    

    