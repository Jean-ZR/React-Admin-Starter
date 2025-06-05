
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2, Store, CheckCircle } from "lucide-react";
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
  writeBatch,
  where,
  getDocs,
} from 'firebase/firestore';
import { EstablishmentFormModal, type EstablishmentFormData, type Establishment } from '@/components/settings/establishment-form-modal';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { format } from 'date-fns';

export default function EstablishmentsPage() {
  const { user: currentUser, role: currentUserRole, isFirebaseConfigured } = useAuth();
  const { toast } = useToast();

  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEstablishment, setEditingEstablishment] = useState<Establishment | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [establishmentToDelete, setEstablishmentToDelete] = useState<Establishment | null>(null);

  const isAdmin = currentUserRole === 'admin';

  const fetchEstablishments = useCallback(() => {
    if (!isAdmin || !isFirebaseConfigured) {
      setIsLoading(false);
      if(isAdmin && !isFirebaseConfigured) {
          toast({title: "Servicio No Disponible", description: "La gestión de establecimientos no está disponible ya que Firebase no está configurado.", variant: "destructive"});
      } else if (!isAdmin && isFirebaseConfigured) {
          toast({title: "Acceso Denegado", description: "No tienes permiso para ver los establecimientos.", variant: "destructive"});
      }
      setEstablishments([]);
      return () => {}; 
    }
    setIsLoading(true);
    const establishmentsCollectionRef = collection(db, 'establishments');
    const q = query(establishmentsCollectionRef, orderBy('code', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const estData = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as EstablishmentFormData),
        createdAt: docSnapshot.data().createdAt, // Preserve Timestamp if it exists
        updatedAt: docSnapshot.data().updatedAt,
      }));
      setEstablishments(estData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching establishments:", error);
      toast({ title: "Error", description: "No se pudieron cargar los establecimientos.", variant: "destructive" });
      setIsLoading(false);
    });

    return unsubscribe;
  }, [isAdmin, isFirebaseConfigured, toast]);

  useEffect(() => {
    const unsubscribe = fetchEstablishments();
    return () => unsubscribe();
  }, [fetchEstablishments]);

  const handleAddEstablishment = () => {
    if (!isAdmin) return;
    setEditingEstablishment(null);
    setIsModalOpen(true);
  };

  const handleEditEstablishment = (establishment: Establishment) => {
    if (!isAdmin) return;
    setEditingEstablishment(establishment);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (establishment: Establishment) => {
    if (!isAdmin) return;
    setEstablishmentToDelete(establishment);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteEstablishment = async () => {
    if (!isAdmin || !establishmentToDelete || !establishmentToDelete.id) return;
    try {
      await deleteDoc(doc(db, 'establishments', establishmentToDelete.id));
      toast({ title: "Éxito", description: `Establecimiento "${establishmentToDelete.tradeName}" eliminado.` });
    } catch (error) {
      console.error("Error deleting establishment:", error);
      toast({ title: "Error", description: "No se pudo eliminar el establecimiento.", variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setEstablishmentToDelete(null);
    }
  };

  const handleSaveEstablishment = async (data: EstablishmentFormData, id?: string) => {
    if (!isAdmin || !isFirebaseConfigured) {
        toast({ title: "Operación Fallida", description: "No se puede guardar el establecimiento.", variant: "destructive"});
        return;
    }
    
    const batch = writeBatch(db);

    try {
      // If setting this establishment as main, unset others
      if (data.isMain) {
        const q = query(collection(db, "establishments"), where("isMain", "==", true));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
          if (docSnap.id !== id) { // Don't unset the current one if it's an update
            batch.update(doc(db, "establishments", docSnap.id), { isMain: false });
          }
        });
      }
      
      if (id) { // Editing existing establishment
        const estDocRef = doc(db, 'establishments', id);
        batch.update(estDocRef, { ...data, updatedAt: serverTimestamp() });
        await batch.commit();
        toast({ title: "Éxito", description: "Establecimiento actualizado." });
      } else { // Adding new establishment
        const newEstRef = doc(collection(db, 'establishments')); // Auto-generate ID
        batch.set(newEstRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        await batch.commit();
        toast({ title: "Éxito", description: "Establecimiento añadido." });
      }
      setIsModalOpen(false);
      setEditingEstablishment(null);
    } catch (error) {
      console.error("Error saving establishment:", error);
      toast({ title: "Error", description: "No se pudo guardar el establecimiento.", variant: "destructive" });
    }
  };

  if (!isFirebaseConfigured && isAdmin) {
    return (
         <Card className="bg-card text-card-foreground border-border">
            <CardHeader>
                <CardTitle className="text-foreground">Servicio No Disponible</CardTitle>
                <CardDescription className="text-muted-foreground">
                La gestión de establecimientos no está disponible ya que Firebase no está configurado correctamente.
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
                No tienes los permisos necesarios para gestionar establecimientos.
                </CardDescription>
            </CardHeader>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Title handled by AppLayout */}
        <div className="flex-1"></div> {/* Spacer */}
        <Button size="sm" className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddEstablishment} disabled={!isAdmin || isLoading}>
          <PlusCircle className="h-3.5 w-3.5" />
          Añadir Establecimiento
        </Button>
      </div>

      <Card className="bg-card text-card-foreground border-border shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground">Lista de Establecimientos</CardTitle>
          <CardDescription className="text-muted-foreground">Administra las sucursales o puntos de venta de tu empresa.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Cargando establecimientos...</p>
            </div>
          ) : establishments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No hay establecimientos registrados. Haz clic en "Añadir Establecimiento" para empezar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption className="py-4 text-muted-foreground">Total de establecimientos: {establishments.length}</TableCaption>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Código</TableHead>
                    <TableHead className="text-muted-foreground">Nombre Comercial</TableHead>
                    <TableHead className="text-muted-foreground">Dirección</TableHead>
                    <TableHead className="text-muted-foreground">Distrito</TableHead>
                    <TableHead className="text-center text-muted-foreground">Principal</TableHead>
                    <TableHead className="text-right text-muted-foreground">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {establishments.map((est) => (
                    <TableRow key={est.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-mono text-xs text-muted-foreground">{est.code}</TableCell>
                      <TableCell className="font-medium text-foreground">{est.tradeName}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate" title={est.address}>{est.address}</TableCell>
                      <TableCell className="text-muted-foreground">{est.district}</TableCell>
                      <TableCell className="text-center">
                        {est.isMain ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <Store className="h-5 w-5 text-muted-foreground/50 mx-auto" />}
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
                            <DropdownMenuItem onClick={() => handleEditEstablishment(est)} className="cursor-pointer hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(est)}
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
        {establishments.length > 0 && (
            <CardFooter className="border-t border-border pt-4">
                <div className="text-xs text-muted-foreground">
                Mostrando <strong>{establishments.length}</strong> establecimiento(s).
                </div>
            </CardFooter>
        )}
      </Card>

      <EstablishmentFormModal
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false);
            setEditingEstablishment(null);
        }}
        onSubmit={handleSaveEstablishment}
        establishmentData={editingEstablishment}
      />

      {establishmentToDelete && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDeleteEstablishment}
          itemName={`el establecimiento "${establishmentToDelete.tradeName}" (Código: ${establishmentToDelete.code})`}
        />
      )}
    </div>
  );
}
