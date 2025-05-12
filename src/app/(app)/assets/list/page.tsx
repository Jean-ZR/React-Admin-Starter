'use client'; // Required for useState and onClick handlers

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Removed SampleDataGrid as we are building the table here
import { ListFilter, Search, MoreHorizontal, PlusCircle, FileDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem, // Added DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableCaption,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image"; // Keep if using images
import { AssetFormModal } from '@/components/assets/asset-form-modal'; // Import the modal
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'; // Import generic delete dialog

// Sample data (replace with actual data fetching)
const assets = [
  { id: 'ASSET001', name: 'Laptop Pro 15"', category: 'Electronics', status: 'Active', location: 'Office A', assignedTo: 'John Doe', purchaseDate: '2023-01-15', serialNumber: 'SN12345', cost: 1200, warrantyEnd: '2025-01-15', image: 'https://picsum.photos/40/40?random=1', dataAiHint: 'laptop computer' },
  { id: 'ASSET002', name: 'Office Chair Ergonomic', category: 'Furniture', status: 'Active', location: 'Office B', assignedTo: 'Jane Smith', purchaseDate: '2023-02-20', serialNumber: 'SN67890', cost: 350, warrantyEnd: '2024-02-20', image: 'https://picsum.photos/40/40?random=2', dataAiHint: 'office chair' },
  { id: 'ASSET003', name: 'Monitor UltraWide', category: 'Electronics', status: 'In Repair', location: 'IT Department', assignedTo: '', purchaseDate: '2022-11-01', serialNumber: 'SN11223', cost: 600, warrantyEnd: '2024-11-01', image: 'https://picsum.photos/40/40?random=3', dataAiHint: 'monitor screen' },
  // Add more assets as needed
];

type Asset = typeof assets[0]; // Define Asset type from data

export default function AssetListPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

    const handleAddAsset = () => {
        setEditingAsset(null); // Ensure we are adding, not editing
        setIsModalOpen(true);
    };

    const handleEditAsset = (asset: Asset) => {
        setEditingAsset(asset);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (asset: Asset) => {
        setAssetToDelete(asset);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (assetToDelete) {
            console.log("Deleting asset:", assetToDelete.id); // Replace with actual delete logic
            // TODO: Call API to delete asset
            setIsDeleteDialogOpen(false);
            setAssetToDelete(null);
            // Optionally refetch data here
        }
    };

     const handleExport = () => {
        console.log("Exporting assets..."); // Placeholder for export logic
        // TODO: Implement actual CSV/PDF export
        alert("Export functionality not yet implemented.");
    };


    const handleSaveAsset = (formData: any) => {
        if (editingAsset) {
            console.log("Updating asset:", editingAsset.id, formData);
            // TODO: Call API to update asset
        } else {
            console.log("Adding new asset:", formData);
            // TODO: Call API to add asset
        }
        // Optionally refetch data here
    };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">
          Asset Inventory
        </h1>
        <div className="flex gap-2 items-center w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search assets..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Inactive</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>
                In Repair
              </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                Disposed
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" className="h-9 gap-1" onClick={handleExport}>
            <FileDown className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Export</span>
          </Button>
          <Button size="sm" className="h-9 gap-1" onClick={handleAddAsset}>
             <PlusCircle className="h-3.5 w-3.5" />
             <span className="sr-only sm:not-sr-only">Add Asset</span>
          </Button>
        </div>
      </div>

       {/* Actual data table component */}
      <div className="overflow-hidden rounded-lg border shadow-sm">
        <Table>
            <TableCaption>A list of your assets.</TableCaption>
            <TableHeader>
            <TableRow>
                 <TableHead className="hidden w-[80px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead className="w-[100px]">Asset ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {assets.map((asset) => (
                <TableRow key={asset.id}>
                 <TableCell className="hidden sm:table-cell">
                      <Image
                        alt="Asset image"
                        className="aspect-square rounded-md object-cover"
                        height="40"
                        src={asset.image || 'https://picsum.photos/40/40?grayscale'} // Fallback image
                        width="40"
                        data-ai-hint={asset.dataAiHint}
                      />
                    </TableCell>
                <TableCell className="font-medium">{asset.id}</TableCell>
                <TableCell>{asset.name}</TableCell>
                <TableCell>{asset.category}</TableCell>
                <TableCell>
                    <Badge variant={asset.status === 'Active' ? 'default' : asset.status === 'In Repair' ? 'secondary' : 'outline'}
                        className={asset.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : asset.status === 'In Repair' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 'text-muted-foreground'}>
                    {asset.status}
                    </Badge>
                </TableCell>
                <TableCell>{asset.location}</TableCell>
                <TableCell>{asset.assignedTo || 'N/A'}</TableCell>
                <TableCell>{asset.purchaseDate}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEditAsset(asset)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                         <DropdownMenuItem>Assign</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                           className="text-destructive"
                           onClick={() => handleDeleteClick(asset)}
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


      <p className="text-sm text-muted-foreground">
        Full inventory list with filtering, sorting, and search capabilities. Audit logs and role-based access are applied.
      </p>

       {/* Add/Edit Modal */}
        <AssetFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSaveAsset}
            assetData={editingAsset}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={confirmDelete}
            itemName={assetToDelete?.name || 'this asset'}
        />
    </div>
  );
}
