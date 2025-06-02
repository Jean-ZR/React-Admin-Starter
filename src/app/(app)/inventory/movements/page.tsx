
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpCircle, ArrowDownCircle, Package, User, ArrowRightLeft, Settings2, FileDown, PlusCircle, MoreHorizontal, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MovementFormModal, type MovementFormData } from '@/components/inventory/movement-form-modal';
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
  getDocs,
  getDoc, // Added getDoc for fetching single item if needed
  where,
  type DocumentData,
} from 'firebase/firestore';
import { format } from 'date-fns'; 
import { useAuth } from '@/contexts/auth-context';
// Removed Tabs, TabsList, TabsTrigger, Link, usePathname as navigation is now in sidebar

interface InventoryItemBasic {
  id: string;
  name: string;
  sku: string;
}

interface MovementLogEntry extends MovementFormData {
  id: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  user?: string; 
  itemName?: string; 
  itemSku?: string; 
}


export default function StockMovementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<MovementLogEntry | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState<MovementLogEntry | null>(null);

  const [movementLogs, setMovementLogs] = useState<MovementLogEntry[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemBasic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>(''); 
  const { toast } = useToast();
  const { user: authUser } = useAuth();

  const fetchInventoryItems = useCallback(async () => {
    try {
      const itemsCollectionRef = collection(db, 'inventoryItems');
      const q = query(itemsCollectionRef, orderBy('name'));
      const snapshot = await getDocs(q);
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        sku: doc.data().sku,
      } as InventoryItemBasic));
      setInventoryItems(itemsData);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      toast({ title: "Error", description: "Could not fetch inventory items for selection.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  const fetchMovementLogs = useCallback(() => {
    setIsLoading(true);
    const movementsCollectionRef = collection(db, 'inventoryMovements');
    let q = query(movementsCollectionRef, orderBy('createdAt', 'desc'));

    if (filterType && filterType !== 'all') {
        q = query(q, where('type', '==', filterType));
    }

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const logsDataPromises = snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data() as DocumentData;
        let itemName = data.itemName || 'N/A';
        let itemSku = data.itemSku || 'N/A';

        if ((!itemName || !itemSku) && data.itemId) {
          try {
            const itemDocRef = doc(db, 'inventoryItems', data.itemId);
            const itemSnap = await getDoc(itemDocRef);
            if (itemSnap.exists()) {
              itemName = itemSnap.data().name || itemName;
              itemSku = itemSnap.data().sku || itemSku;
            }
          } catch (e) {
            console.error(`Error fetching item details for itemId ${data.itemId}:`, e);
          }
        }

        return {
          id: docSnapshot.id,
          ...data,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          itemName,
          itemSku,
        } as MovementLogEntry;
      });

      let logsData = await Promise.all(logsDataPromises);

      if (searchTerm) {
        logsData = logsData.filter(log =>
          log.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.itemSku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.sourceOrDestination?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setMovementLogs(logsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching movement logs:", error);
      toast({ title: "Error", description: "Could not fetch movement logs.", variant: "destructive" });
      setIsLoading(false);
    });

    return unsubscribe;
  }, [toast, searchTerm, filterType]);

  useEffect(() => {
    const unsubscribe = fetchMovementLogs();
    return () => unsubscribe();
  }, [fetchMovementLogs]);


  const handleRecordMovementClick = () => {
    setEditingMovement(null);
    setIsModalOpen(true);
  };

  const handleEditMovementClick = (movement: MovementLogEntry) => {
    setEditingMovement(movement);
    setIsModalOpen(true);
  };

  const handleDeleteMovementClick = (movement: MovementLogEntry) => {
    setMovementToDelete(movement);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteMovement = async () => {
    if (movementToDelete) {
      try {
        await deleteDoc(doc(db, 'inventoryMovements', movementToDelete.id));
        toast({ title: "Success", description: "Movement log deleted successfully." });
      } catch (error) {
        console.error("Error deleting movement log:", error);
        toast({ title: "Error", description: "Could not delete movement log.", variant: "destructive" });
      } finally {
        setIsDeleteDialogOpen(false);
        setMovementToDelete(null);
      }
    }
  };

  const handleSaveMovement = async (formData: MovementFormData) => {
    const selectedItem = inventoryItems.find(item => item.id === formData.itemId);

    const dataToSave = {
      ...formData,
      quantity: formData.type === 'Outbound' || (formData.type === 'Adjustment' && formData.quantity < 0) 
                  ? -Math.abs(formData.quantity)
                  : Math.abs(formData.quantity),
      itemName: selectedItem?.name || 'Unknown Item',
      itemSku: selectedItem?.sku || 'N/A',
      user: authUser?.displayName || authUser?.email || 'System', 
    };

    try {
      if (editingMovement) {
        const movementDocRef = doc(db, 'inventoryMovements', editingMovement.id);
        await updateDoc(movementDocRef, { ...dataToSave, updatedAt: serverTimestamp() });
        toast({ title: "Success", description: "Movement log updated successfully." });
      } else {
        await addDoc(collection(db, 'inventoryMovements'), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
        toast({ title: "Success", description: "Movement log recorded successfully." });
      }
      setIsModalOpen(false);
      setEditingMovement(null);
    } catch (error) {
      console.error("Error saving movement log:", error);
      toast({ title: "Error", description: "Could not save movement log.", variant: "destructive" });
    }
  };

  const handleExport = () => {
    if (movementLogs.length === 0) {
        toast({ title: "No Data", description: "No movement logs to export.", variant: "default" });
        return;
    }
    console.log("Exporting movement log...", movementLogs);
    alert("Export functionality to be implemented with a library like jsPDF or papaparse.");
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         {/* Title is now handled by layout.tsx */}
        <div className="flex-1"></div> {/* Spacer */}
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search movements..."
              className="pl-8 sm:w-[200px] lg:w-[300px] bg-background border-input text-foreground placeholder:text-muted-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-9 sm:w-[150px] bg-background border-input text-foreground">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground border-border">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Inbound">Inbound</SelectItem>
              <SelectItem value="Outbound">Outbound</SelectItem>
              <SelectItem value="Adjustment">Adjustment</SelectItem>
              <SelectItem value="Transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-9 gap-1 text-muted-foreground hover:text-foreground border-input hover:bg-accent" onClick={handleExport}>
            <FileDown className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Export Log</span>
          </Button>
          <Button size="sm" className="h-9 gap-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleRecordMovementClick}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Record Movement</span>
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border border-border bg-card text-card-foreground">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground">Movement Log</CardTitle>
          <CardDescription className="text-muted-foreground">Monitor incoming and outgoing inventory changes.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading movement logs...</p>
            </div>
          ) : movementLogs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No movement logs found. Click "Record Movement" to add one.
            </div>
          ) : (
            <div className="overflow-x-auto">
                <Table>
                <TableCaption className="py-4 text-muted-foreground">Detailed log of all inventory movements. {movementLogs.length} record(s) found.</TableCaption>
                <TableHeader>
                    <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Item (SKU)</TableHead>
                    <TableHead className="text-right text-muted-foreground">Quantity</TableHead>
                    <TableHead className="text-muted-foreground">Source / Dest.</TableHead>
                    <TableHead className="text-muted-foreground">User</TableHead>
                    <TableHead className="text-muted-foreground">Notes</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {movementLogs.map((log) => (
                    <TableRow key={log.id} className="border-border hover:bg-muted/50">
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap py-2 px-3">
                        {log.createdAt ? format(log.createdAt.toDate(), 'yyyy-MM-dd HH:mm') : 'N/A'}
                        </TableCell>
                        <TableCell className="py-2 px-3">
                        <Badge variant="outline" className="gap-1 items-center border-border text-muted-foreground">
                            {log.type === 'Inbound' && <ArrowDownCircle className="h-3 w-3 text-green-600 dark:text-green-400" />}
                            {log.type === 'Outbound' && <ArrowUpCircle className="h-3 w-3 text-red-600 dark:text-red-400" />}
                            {log.type === 'Transfer' && <ArrowRightLeft className="h-3 w-3 text-blue-600 dark:text-blue-400" />}
                            {log.type === 'Adjustment' && <Settings2 className="h-3 w-3 text-orange-600 dark:text-orange-400" />}
                            {log.type}
                        </Badge>
                        </TableCell>
                        <TableCell className="font-medium flex items-center gap-1 text-foreground py-2 px-3">
                            <Package className="h-3 w-3 text-muted-foreground hidden sm:inline-block" />
                            <div>
                                {log.itemName || 'N/A'}
                                <span className="text-xs text-muted-foreground block sm:inline sm:ml-1">({log.itemSku || 'N/A'})</span>
                            </div>
                        </TableCell>
                        <TableCell className={`text-right font-medium py-2 px-3 ${Number(log.quantity) > 0 ? 'text-green-600 dark:text-green-400' : Number(log.quantity) < 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                        {Number(log.quantity) > 0 ? '+' : ''}{log.quantity}
                        </TableCell>
                        <TableCell className="text-muted-foreground py-2 px-3">{log.sourceOrDestination || 'N/A'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground flex items-center gap-1 py-2 px-3">
                            <User className="h-3 w-3 text-muted-foreground hidden sm:inline-block" />
                            {log.user || 'N/A'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground truncate max-w-[150px] py-2 px-3" title={log.notes}>{log.notes || 'N/A'}</TableCell>
                        <TableCell className="py-2 px-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditMovementClick(log)} className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">Edit</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border"/>
                            <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive hover:!bg-destructive/10 hover:!text-destructive"
                                onClick={() => handleDeleteMovementClick(log)}
                            >
                                Delete
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
        <CardFooter className="border-t border-border pt-4">
          <div className="text-xs text-muted-foreground">
            Showing <strong>{movementLogs.length}</strong> movement log(s).
          </div>
        </CardFooter>
      </Card>

      <p className="text-sm text-muted-foreground">
        Monitor incoming and outgoing inventory with detailed logs and filtering. Audit logs and role-based access are applied.
        Automatic stock quantity updates based on movements are not yet implemented.
      </p>

      <MovementFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveMovement}
        movementData={editingMovement}
        inventoryItems={inventoryItems}
      />
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteMovement}
        itemName={editingMovement ? `movement log for ${editingMovement.itemName}` : 'this movement log'}
      />
    </div>
  );
}

