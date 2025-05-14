
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Search, ListFilter, PlusCircle, FileDown, MoreHorizontal, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ItemFormModal, type ItemFormData } from '@/components/inventory/item-form-modal';
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
  where,
  orderBy,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { exportToCSV, exportToPDF } from '@/lib/export';

export interface StockItem extends ItemFormData {
  id: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const ALL_STATUS_OPTIONS = ["In Stock", "Low Stock", "Out of Stock"];

export default function StockManagementPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StockItem | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);
    
    const [allStockItems, setAllStockItems] = useState<StockItem[]>([]); // Raw data from Firestore
    const [displayedStockItems, setDisplayedStockItems] = useState<StockItem[]>([]); // Data after all filters
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilters, setStatusFilters] = useState<string[]>([]);
    const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const { toast } = useToast();

    // Fetch initial stock items from Firestore
    useEffect(() => {
      setIsLoading(true);
      const itemsCollectionRef = collection(db, 'inventoryItems');
      const q = query(itemsCollectionRef, orderBy('name', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const itemsData = snapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            ...data,
          } as StockItem;
        });
        setAllStockItems(itemsData);
        
        // Extract unique categories for filtering
        const uniqueCategories = Array.from(new Set(itemsData.map(item => item.category).filter(Boolean)));
        setAvailableCategories(uniqueCategories.sort());

        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching stock items:", error);
        toast({ title: "Error", description: "Could not fetch stock items.", variant: "destructive" });
        setIsLoading(false);
      });

      return () => unsubscribe();
    }, [toast]);

    // Apply filters and search whenever dependencies change
    useEffect(() => {
      let filtered = [...allStockItems];

      // Category filtering
      if (categoryFilters.length > 0) {
        filtered = filtered.filter(item => categoryFilters.includes(item.category));
      }

      // Search term filtering
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(lowerSearchTerm) ||
          item.sku.toLowerCase().includes(lowerSearchTerm) ||
          item.category.toLowerCase().includes(lowerSearchTerm) ||
          (item.location && item.location.toLowerCase().includes(lowerSearchTerm))
        );
      }

      // Status filtering (client-side due to complexity of reorderLevel comparison)
      if (statusFilters.length > 0) {
        filtered = filtered.filter(item => {
          if (statusFilters.includes("Out of Stock") && item.quantity === 0) return true;
          if (statusFilters.includes("Low Stock") && item.quantity > 0 && item.quantity <= item.reorderLevel) return true;
          if (statusFilters.includes("In Stock") && item.quantity > item.reorderLevel) return true;
          return false;
        });
      }
      
      setDisplayedStockItems(filtered);
    }, [allStockItems, searchTerm, statusFilters, categoryFilters]);


    const handleAddItem = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEditItem = (item: StockItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (item: StockItem) => {
        setItemToDelete(item);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            try {
                await deleteDoc(doc(db, 'inventoryItems', itemToDelete.id));
                toast({ title: "Success", description: "Item deleted successfully." });
            } catch (error) {
                console.error("Error deleting item:", error);
                toast({ title: "Error", description: "Could not delete item.", variant: "destructive" });
            } finally {
                setIsDeleteDialogOpen(false);
                setItemToDelete(null);
            }
        }
    };

    const handleSaveItem = async (formData: ItemFormData) => {
      const dataToSave: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'> & { createdAt?: Timestamp, updatedAt?: Timestamp } = {
          ...formData,
          image: formData.image || `https://placehold.co/600x400.png`,
          dataAiHint: formData.dataAiHint || formData.name.toLowerCase().split(' ').slice(0,2).join(' ') || 'inventory item',
      };

      try {
          if (editingItem) {
              const itemDocRef = doc(db, 'inventoryItems', editingItem.id);
              await updateDoc(itemDocRef, { ...dataToSave, updatedAt: serverTimestamp() });
              toast({ title: "Success", description: "Item updated successfully." });
          } else {
              await addDoc(collection(db, 'inventoryItems'), {
                 ...dataToSave,
                 createdAt: serverTimestamp(),
                 updatedAt: serverTimestamp()
              });
              toast({ title: "Success", description: "Item added successfully." });
          }
          setIsModalOpen(false);
          setEditingItem(null);
      } catch (error) {
          console.error("Error saving item:", error);
          toast({ title: "Error", description: "Could not save item.", variant: "destructive" });
      }
    };
    
    const handleStatusFilterChange = (status: string) => {
        setStatusFilters(prevFilters =>
            prevFilters.includes(status)
                ? prevFilters.filter(s => s !== status)
                : [...prevFilters, status]
        );
    };

    const handleCategoryFilterChange = (category: string) => {
        setCategoryFilters(prevFilters =>
            prevFilters.includes(category)
                ? prevFilters.filter(c => c !== category)
                : [...prevFilters, category]
        );
    };

    const handleExportCSV = () => {
        if (displayedStockItems.length === 0) {
            toast({ title: "No Data", description: "No items to export.", variant: "default" });
            return;
        }
        exportToCSV(displayedStockItems.map(({ id, createdAt, updatedAt, ...rest }) => ({
            ...rest,
            // Any specific formatting for CSV if needed
        })), 'stock_items_list');
    };

    const handleExportPDF = () => {
      if (displayedStockItems.length === 0) {
            toast({ title: "No Data", description: "No items to export.", variant: "default" });
            return;
        }
        const columns = [
            { header: 'SKU', dataKey: 'sku' },
            { header: 'Name', dataKey: 'name' },
            { header: 'Category', dataKey: 'category' },
            { header: 'Location', dataKey: 'location' },
            { header: 'Quantity', dataKey: 'quantity' },
            { header: 'Reorder Lvl', dataKey: 'reorderLevel' },
            { header: 'Cost', dataKey: 'cost' },
        ];
        exportToPDF({
            data: displayedStockItems.map(item => ({
              ...item,
              cost: item.cost !== null && item.cost !== undefined ? `$${item.cost.toFixed(2)}` : 'N/A',
              location: item.location || "N/A",
            })),
            columns: columns,
            title: 'Stock Items List',
            filename: 'stock_items_list.pdf',
        });
    };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">
          Stock Management
        </h1>
        <div className="flex gap-2 items-center w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search stock items..."
              className="pl-8 sm:w-[200px] lg:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter Status
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_STATUS_OPTIONS.map(status => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilters.includes(status)}
                  onCheckedChange={() => handleStatusFilterChange(status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter Category
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableCategories.length > 0 ? availableCategories.map(cat => (
                <DropdownMenuCheckboxItem
                  key={cat}
                  checked={categoryFilters.includes(cat)}
                  onCheckedChange={() => handleCategoryFilterChange(cat)}
                >
                  {cat}
                </DropdownMenuCheckboxItem>
              )) : <DropdownMenuItem disabled>No categories found</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button size="sm" variant="outline" className="h-9 gap-1">
                 <FileDown className="h-3.5 w-3.5" />
                 <span className="sr-only sm:not-sr-only">Export</span>
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
               <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
               <DropdownMenuItem onClick={handleExportPDF}>Export as PDF</DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
          <Button size="sm" className="h-9 gap-1" onClick={handleAddItem}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Add Item</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Levels</CardTitle>
           <CardDescription>Real-time tracking of inventory items.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading inventory items...</p>
            </div>
          ) : displayedStockItems.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">
                No items found matching your criteria.
              </div>
          ) : (
            <Table>
              <TableCaption>List of current inventory items. {displayedStockItems.length} item(s) found.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[64px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                  <TableHead>Name (SKU)</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedStockItems.map((item) => {
                  let statusLabel = 'In Stock';
                  let statusClass = '';
                  if (item.quantity === 0) {
                    statusLabel = 'Out of Stock';
                    statusClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
                  } else if (item.quantity <= item.reorderLevel) {
                    statusLabel = 'Low Stock';
                    statusClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
                  } else {
                     statusClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
                  }

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="hidden sm:table-cell">
                          <Image
                            alt={item.name || "Item image"}
                            className="aspect-square rounded-md object-cover"
                            height="40"
                            src={item.image || `https://placehold.co/40x40.png`}
                            width="40"
                            data-ai-hint={item.dataAiHint || 'inventory item'}
                            onError={(e) => e.currentTarget.src = `https://placehold.co/40x40.png`}
                          />
                        </TableCell>
                      <TableCell className="font-medium">{item.name} <span className="text-xs text-muted-foreground">({item.sku})</span></TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.location || 'N/A'}</TableCell>
                      <TableCell>
                          <Badge variant={item.quantity === 0 ? "destructive" : item.quantity <= item.reorderLevel ? "secondary" : "outline"}
                                 className={statusClass}>
                            {statusLabel}
                          </Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{item.cost ? `$${item.cost.toFixed(2)}` : 'N/A'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditItem(item)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem>View History (Not Impl.)</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteClick(item)}
                            >
                                Delete Item
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
         <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>{displayedStockItems.length}</strong> of <strong>{allStockItems.length}</strong> items
          </div>
        </CardFooter>
      </Card>

      <p className="text-sm text-muted-foreground">
        Real-time tracking of inventory levels with search and filtering. Audit logs and role-based access are applied.
      </p>

       <ItemFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveItem}
        itemData={editingItem}
        availableCategories={availableCategories}
      />
       <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemName={itemToDelete?.name || 'this item'}
      />
    </div>
  );
}
