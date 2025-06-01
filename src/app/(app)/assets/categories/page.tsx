
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CategoryFormModal, type CategoryFormData } from '@/components/assets/category-form-modal';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase/config';
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  getCountFromServer,
  where, 
} from 'firebase/firestore';
// Removed Tabs import as navigation is now in sidebar for Assets

interface Category extends CategoryFormData {
  id: string;
  assetCount?: number; 
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export default function AssetCategoriesPage() {
  // Removed usePathname
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [currentCategories, setCurrentCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAssetCount = useCallback(async (categoryName: string): Promise<number> => {
    try {
      const assetsCollectionRef = collection(db, 'assets');
      const q = query(assetsCollectionRef, where('category', '==', categoryName));
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error(`Error fetching asset count for ${categoryName}:`, error);
      return 0; 
    }
  }, []);


  const fetchCategories = useCallback(() => {
    setIsLoading(true);
    const categoriesCollectionRef = collection(db, 'assetCategories');
    const q = query(categoriesCollectionRef, orderBy('name'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const categoriesDataPromises = snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        const categoryName = data.name;
        const assetCount = await fetchAssetCount(categoryName);
        return {
          id: docSnapshot.id,
          assetCount, 
          ...data,
        } as Category;
      });
      
      const categoriesData = await Promise.all(categoriesDataPromises);
      setCurrentCategories(categoriesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching categories:", error);
      toast({ title: "Error", description: "Could not fetch categories.", variant: "destructive" });
      setIsLoading(false);
    });

    return unsubscribe;
  }, [toast, fetchAssetCount]);

  useEffect(() => {
    const unsubscribe = fetchCategories();
    return () => unsubscribe();
  }, [fetchCategories]);


  const handleAddCategory = () => {
      setEditingCategory(null);
      setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
      setEditingCategory(category);
      setIsModalOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
      setCategoryToDelete(category);
      setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
      if (categoryToDelete) {
          const assetsInUse = await fetchAssetCount(categoryToDelete.name);
          if (assetsInUse > 0) {
              toast({
                  title: "Cannot Delete Category",
                  description: `Category "${categoryToDelete.name}" is in use by ${assetsInUse} asset(s). Please reassign them first.`,
                  variant: "destructive",
                  duration: 5000,
              });
              setIsDeleteDialogOpen(false);
              setCategoryToDelete(null);
              return;
          }

          try {
              await deleteDoc(doc(db, 'assetCategories', categoryToDelete.id));
              toast({ title: "Success", description: "Category deleted successfully." });
          } catch (error) {
              console.error("Error deleting category:", error);
              toast({ title: "Error", description: "Could not delete category.", variant: "destructive" });
          } finally {
              setIsDeleteDialogOpen(false);
              setCategoryToDelete(null);
          }
      }
  };

  const handleSaveCategory = async (formData: CategoryFormData) => {
      try {
          if (editingCategory) {
              const categoryDocRef = doc(db, 'assetCategories', editingCategory.id);
              await updateDoc(categoryDocRef, { ...formData, updatedAt: serverTimestamp() });
              toast({ title: "Success", description: "Category updated successfully." });
          } else {
              await addDoc(collection(db, 'assetCategories'), {
                 ...formData,
                 createdAt: serverTimestamp()
              });
              toast({ title: "Success", description: "Category added successfully." });
          }
          setIsModalOpen(false);
          setEditingCategory(null);
      } catch (error) {
          console.error("Error saving category:", error);
          toast({ title: "Error", description: "Could not save category.", variant: "destructive" });
      }
  };

  return (
    <div className="space-y-6">
       {/* Removed Tabs navigation */}
       <div className="flex items-center justify-between">
         <h1 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
           Categorías de Activos
         </h1>
         <Button size="sm" onClick={handleAddCategory} className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="h-3.5 w-3.5"/> Añadir Categoría
        </Button>
       </div>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Gestionar Categorías</CardTitle>
          <CardDescription className="text-muted-foreground">Organiza tus activos en grupos lógicos.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center min-h-[150px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Cargando categorías...</p>
            </div>
          ) : currentCategories.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">
                No se encontraron categorías de activos. Haz clic en "Añadir Categoría" para crear una.
              </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Nombre Categoría</TableHead>
                  <TableHead className="text-muted-foreground">Descripción</TableHead>
                  <TableHead className="text-center text-muted-foreground">Nº Activos</TableHead>
                  <TableHead><span className="sr-only">Acciones</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCategories.map((category) => (
                  <TableRow key={category.id} className="border-border hover:bg-muted/50">
                    <TableCell className="font-medium text-foreground">{category.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{category.description || 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="border-border text-muted-foreground">{category.assetCount ?? 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Alternar menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditCategory(category)} className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">Editar</DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border"/>
                          <DropdownMenuItem onClick={() => handleDeleteClick(category)} className="text-destructive focus:bg-destructive/10 focus:text-destructive hover:!bg-destructive/10 hover:!text-destructive">
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
         <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>{currentCategories.length}</strong> categor{currentCategories.length === 1 ? 'ía' : 'ías'}
          </div>
        </CardFooter>
      </Card>

      <p className="text-sm text-muted-foreground">
        Organiza y gestiona las clasificaciones de activos. Se aplican registros de auditoría y acceso basado en roles.
      </p>

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveCategory}
        categoryData={editingCategory}
      />
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteCategory}
        itemName={categoryToDelete?.name || 'esta categoría'}
      />
    </div>
  );
}

    