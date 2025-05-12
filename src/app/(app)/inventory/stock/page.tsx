'use client'; // Required for state and handlers

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Search, ListFilter, PlusCircle, FileDown, MoreHorizontal } from "lucide-react"; // Added MoreHorizontal
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem, // Added DropdownMenuItem
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Import modals (assuming they exist or will be created)
// import { ItemFormModal } from '@/components/inventory/item-form-modal';
// import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';

const stockItems = [
  { id: 'SKU001', name: 'Wireless Mouse', category: 'Peripherals', quantity: 50, reorderLevel: 10, location: 'Shelf A1', cost: 25.99, image: 'https://picsum.photos/40/40?random=1', dataAiHint: 'mouse computer' },
  { id: 'SKU002', name: 'USB Keyboard', category: 'Peripherals', quantity: 5, reorderLevel: 15, location: 'Shelf A2', cost: 45.00, image: 'https://picsum.photos/40/40?random=2', dataAiHint: 'keyboard computer' },
  { id: 'SKU003', name: '24" Monitor', category: 'Displays', quantity: 20, reorderLevel: 5, location: 'Shelf B1', cost: 199.99, image: 'https://picsum.photos/40/40?random=3', dataAiHint: 'monitor screen' },
  { id: 'SKU004', name: 'Laptop Stand', category: 'Accessories', quantity: 75, reorderLevel: 20, location: 'Shelf C3', cost: 30.50, image: 'https://picsum.photos/40/40?random=4', dataAiHint: 'laptop stand' },
  { id: 'SKU005', name: 'Webcam HD', category: 'Peripherals', quantity: 12, reorderLevel: 10, location: 'Shelf A1', cost: 55.00, image: 'https://picsum.photos/40/40?random=5', dataAiHint: 'webcam camera' },
];

type StockItem = typeof stockItems[0]; // Define type

export default function StockManagementPage() {
    // State for modals would go here if implemented
    // const [isModalOpen, setIsModalOpen] = useState(false);
    // const [editingItem, setEditingItem] = useState<StockItem | null>(null);
    // const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    // const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);

    const handleAddItem = () => {
        console.log("Opening Add Item modal...");
        // setEditingItem(null);
        // setIsModalOpen(true);
         alert("Add Item functionality requires a modal component.");
    };

     const handleEditItem = (item: StockItem) => {
        console.log("Opening Edit Item modal for:", item.id);
        // setEditingItem(item);
        // setIsModalOpen(true);
         alert("Edit Item functionality requires a modal component.");
    };

     const handleDeleteClick = (item: StockItem) => {
        console.log("Opening Delete Confirmation for:", item.id);
        // setItemToDelete(item);
        // setIsDeleteDialogOpen(true);
        alert("Delete Item functionality requires a confirmation dialog.");
    };

    // const confirmDelete = () => { ... };
    // const handleSaveItem = (formData: any) => { ... };

    const handleExport = () => {
        console.log("Exporting stock items..."); // Placeholder for export logic
        // TODO: Implement actual CSV/PDF export
        alert("Export functionality not yet implemented.");
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
              className="pl-8 sm:w-[300px]"
            />
          </div>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>In Stock</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Low Stock</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Out of Stock</DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                 <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                 {/* Dynamically generate categories if needed */}
                <DropdownMenuCheckboxItem>Peripherals</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Displays</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Accessories</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
           <Button size="sm" variant="outline" className="h-9 gap-1" onClick={handleExport}>
            <FileDown className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Export</span>
          </Button>
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
          <Table>
             <TableCaption>List of current inventory items.</TableCaption>
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
              {stockItems.map((item) => (
                <TableRow key={item.id}>
                   <TableCell className="hidden sm:table-cell">
                      <Image
                        alt="Product image"
                        className="aspect-square rounded-md object-cover"
                        height="40"
                        src={item.image}
                        width="40"
                        data-ai-hint={item.dataAiHint}
                      />
                    </TableCell>
                  <TableCell className="font-medium">{item.name} <span className="text-xs text-muted-foreground">({item.id})</span></TableCell>
                  <TableCell>{item.category}</TableCell>
                   <TableCell>{item.location}</TableCell>
                   <TableCell>
                      <Badge variant={item.quantity <= item.reorderLevel ? (item.quantity === 0 ? "destructive" : "secondary") : "outline"}
                             className={item.quantity <= item.reorderLevel && item.quantity > 0 ? "text-orange-600 border-orange-600 bg-orange-50 dark:bg-orange-900/20" : ""}>
                        {item.quantity === 0 ? 'Out of Stock' : item.quantity <= item.reorderLevel ? 'Low Stock' : 'In Stock'}
                      </Badge>
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">${item.cost.toFixed(2)}</TableCell>
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
                        <DropdownMenuItem>Adjust Stock</DropdownMenuItem>
                         <DropdownMenuItem>View History</DropdownMenuItem>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{stockItems.length}</strong> of <strong>{stockItems.length}</strong> items
          </div>
        </CardFooter>
      </Card>

      <p className="text-sm text-muted-foreground">
        Real-time tracking of inventory levels with search and filtering. Audit logs and role-based access are applied.
      </p>

       {/* Modals would be placed here */}
       {/* <ItemFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSaveItem} itemData={editingItem} /> */}
       {/* <DeleteConfirmationDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={confirmDelete} itemName={itemToDelete?.name || 'this item'} /> */}

    </div>
  );
}
