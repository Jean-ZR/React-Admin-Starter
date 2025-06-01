
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListFilter, Search, MoreHorizontal, PlusCircle, FileDown, Loader2, Eye } from "lucide-react"; // Added Eye
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
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
import Image from "next/image";
import { AssetFormModal, type AssetFormData } from '@/components/assets/asset-form-modal';
import { AssetDetailModal } from '@/components/assets/asset-detail-modal'; // Import new modal
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
  getDocs,
} from 'firebase/firestore';
import { exportToCSV, exportToPDF } from '@/lib/export'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';


interface Asset extends AssetFormData {
  id: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  cost?: number | null;
  purchaseDate?: Timestamp | Date | null;
  warrantyEnd?: Timestamp | Date | null;
}

interface Category {
  id: string;
  name: string;
}

const ALL_STATUSES = ["Active", "Inactive", "In Repair", "Disposed", "Maintenance"];

export default function AssetListPage() {
    const pathname = usePathname();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
    
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // State for detail modal
    const [assetForDetail, setAssetForDetail] = useState<Asset | null>(null); // State for asset to show in detail modal

    const [currentAssets, setCurrentAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilters, setStatusFilters] = useState<string[]>([]);
    const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
    const { toast } = useToast();

    const fetchCategories = useCallback(async () => {
      try {
        const categoriesCollectionRef = collection(db, 'assetCategories');
        const q = query(categoriesCollectionRef, orderBy('name'));
        const snapshot = await getDocs(q);
        const categoriesData = snapshot.docs.map(docSnapshot => ({ // Corrected doc to docSnapshot
          id: docSnapshot.id,
          name: docSnapshot.data().name,
        } as Category));
        setAvailableCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({ title: "Error", description: "Could not fetch asset categories.", variant: "destructive" });
      }
    }, [toast]);

    useEffect(() => {
      fetchCategories();
    }, [fetchCategories]);

    const fetchAssets = useCallback(() => {
      setIsLoading(true);
      const assetsCollectionRef = collection(db, 'assets');
      let q = query(assetsCollectionRef, orderBy('createdAt', 'desc'));

      if (statusFilters.length > 0) {
        q = query(q, where('status', 'in', statusFilters));
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        let assetsData = snapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            ...data,
            purchaseDate: data.purchaseDate instanceof Timestamp ? data.purchaseDate.toDate() : data.purchaseDate,
            warrantyEnd: data.warrantyEnd instanceof Timestamp ? data.warrantyEnd.toDate() : data.warrantyEnd,
            cost: data.cost !== undefined ? Number(data.cost) : null,
          } as Asset;
        });

        if (searchTerm) {
          assetsData = assetsData.filter(asset =>
            asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (asset.assignedTo && asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())) ||
            asset.id.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setCurrentAssets(assetsData);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching assets:", error);
        toast({ title: "Error", description: "Could not fetch assets.", variant: "destructive" });
        setIsLoading(false);
      });

      return unsubscribe;
    }, [statusFilters, searchTerm, toast]);

    useEffect(() => {
      const unsubscribe = fetchAssets();
      return () => unsubscribe();
    }, [fetchAssets]);

    const handleAddAsset = useCallback(() => {
        setEditingAsset(null);
        setIsModalOpen(true);
    }, []);

    const handleEditAsset = useCallback((asset: Asset) => {
        setEditingAsset(asset);
        setIsModalOpen(true);
    }, []);

    const handleViewDetails = useCallback((asset: Asset) => {
        setAssetForDetail(asset);
        setIsDetailModalOpen(true);
    }, []);

    const handleDeleteClick = useCallback((asset: Asset) => {
        setAssetToDelete(asset);
        setIsDeleteDialogOpen(true);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (assetToDelete) {
            try {
                await deleteDoc(doc(db, 'assets', assetToDelete.id));
                toast({ title: "Success", description: "Asset deleted successfully." });
            } catch (error) {
                console.error("Error deleting asset:", error);
                toast({ title: "Error", description: "Could not delete asset.", variant: "destructive" });
            } finally {
                setIsDeleteDialogOpen(false);
                setAssetToDelete(null);
            }
        }
    }, [assetToDelete, toast]);

    const handleSaveAsset = useCallback(async (formData: AssetFormData) => {
        try {
            const dataToSave = {
                ...formData,
                cost: formData.cost !== undefined && formData.cost !== null ? Number(formData.cost) : null,
                purchaseDate: formData.purchaseDate ? Timestamp.fromDate(new Date(formData.purchaseDate)) : null,
                warrantyEnd: formData.warrantyEnd ? Timestamp.fromDate(new Date(formData.warrantyEnd)) : null,
                dataAiHint: formData.dataAiHint || formData.name.toLowerCase().split(' ').slice(0,2).join(' ') || 'asset item',
                image: formData.image || `https://placehold.co/600x400.png`
            };

            if (editingAsset) {
                const assetDocRef = doc(db, 'assets', editingAsset.id);
                await updateDoc(assetDocRef, { ...dataToSave, updatedAt: serverTimestamp() });
                toast({ title: "Success", description: "Asset updated successfully." });
            } else {
                await addDoc(collection(db, 'assets'), {
                   ...dataToSave,
                   createdAt: serverTimestamp(),
                   updatedAt: serverTimestamp()
                });
                toast({ title: "Success", description: "Asset added successfully." });
            }
            setIsModalOpen(false);
            setEditingAsset(null);
        } catch (error) {
            console.error("Error saving asset:", error);
            toast({ title: "Error", description: "Could not save asset.", variant: "destructive" });
        }
    }, [editingAsset, toast]);

    const handleStatusFilterChange = useCallback((status: string) => {
        setStatusFilters(prevFilters =>
            prevFilters.includes(status)
                ? prevFilters.filter(s => s !== status)
                : [...prevFilters, status]
        );
    }, []);
    
    const handleExportCSV = useCallback(() => {
        if (currentAssets.length === 0) {
            toast({ title: "No Data", description: "No assets to export.", variant: "default" });
            return;
        }
        exportToCSV(currentAssets.map(({ id, createdAt, updatedAt, ...rest }) => ({
            ...rest,
            purchaseDate: rest.purchaseDate ? (rest.purchaseDate instanceof Date ? rest.purchaseDate.toLocaleDateString() : String(rest.purchaseDate)) : '',
            warrantyEnd: rest.warrantyEnd ? (rest.warrantyEnd instanceof Date ? rest.warrantyEnd.toLocaleDateString() : String(rest.warrantyEnd)) : '',
        })), 'asset_list');
    }, [currentAssets, toast]);

    const handleExportPDF = useCallback(() => {
      if (currentAssets.length === 0) {
            toast({ title: "No Data", description: "No assets to export.", variant: "default" });
            return;
        }
        const columns = [
            { header: 'Asset ID', dataKey: 'id' },
            { header: 'Name', dataKey: 'name' },
            { header: 'Category', dataKey: 'category' },
            { header: 'Status', dataKey: 'status' },
            { header: 'Location', dataKey: 'location' },
            { header: 'Assigned To', dataKey: 'assignedTo' },
            { header: 'Purchase Date', dataKey: 'purchaseDate' },
            { header: 'Cost', dataKey: 'cost' },
        ];
        exportToPDF({
            data: currentAssets.map(asset => ({
              ...asset,
              assignedTo: asset.assignedTo || 'N/A',
              location: asset.location || 'N/A',
              purchaseDate: asset.purchaseDate ? (asset.purchaseDate instanceof Date ? asset.purchaseDate.toLocaleDateString() : String(asset.purchaseDate)) : 'N/A',
              cost: asset.cost !== null && asset.cost !== undefined ? `$${asset.cost.toFixed(2)}` : 'N/A',
            })),
            columns: columns,
            title: 'Asset List',
            filename: 'asset_list.pdf',
        });
    }, [currentAssets, toast]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue={pathname} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card border-b-0 mb-4 rounded-lg">
          <TabsTrigger value="/assets/list" asChild className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground data-[state=active]:shadow-sm hover:bg-muted/50">
            <Link href="/assets/list">Asset List</Link>
          </TabsTrigger>
          <TabsTrigger value="/assets/categories" asChild className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground data-[state=active]:shadow-sm hover:bg-muted/50">
            <Link href="/assets/categories">Categories</Link>
          </TabsTrigger>
          <TabsTrigger value="/assets/reports" asChild className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground data-[state=active]:shadow-sm hover:bg-muted/50">
            <Link href="/assets/reports">Reports</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="shadow-sm border border-border bg-card text-card-foreground">
        <CardHeader className="border-b border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-foreground">Asset Inventory</CardTitle>
              <CardDescription className="text-muted-foreground">Manage and track all company assets.</CardDescription>
            </div>
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search assets..."
                  className="pl-8 sm:w-[200px] md:w-[200px] lg:w-[250px] bg-background border-input text-foreground placeholder:text-muted-foreground"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1 text-muted-foreground hover:text-foreground border-input hover:bg-accent">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Filter Status
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border"/>
                  {ALL_STATUSES.map(status => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilters.includes(status)}
                      onCheckedChange={() => handleStatusFilterChange(status)}
                      className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground"
                    >
                      {status}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="h-9 gap-1 text-muted-foreground hover:text-foreground border-input hover:bg-accent">
                    <FileDown className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
                  <DropdownMenuItem onClick={handleExportCSV} className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF} className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">Export as PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" className="h-9 gap-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddAsset}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Add Asset</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
            {isLoading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Loading assets...</p>
                </div>
            ) : currentAssets.length === 0 && !searchTerm && statusFilters.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    No assets found. Click "Add Asset" to get started.
                </div>
            ): currentAssets.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    No assets found matching your criteria.
                </div>
            ) : (
            <div className="overflow-x-auto">
                <Table>
                    <TableCaption className="py-4 text-muted-foreground">A list of your company assets. {currentAssets.length} asset(s) found.</TableCaption>
                    <TableHeader>
                    <TableRow className="border-border">
                        <TableHead className="hidden w-[80px] sm:table-cell">
                        <span className="sr-only">Image</span>
                        </TableHead>
                        <TableHead className="w-[130px] text-muted-foreground">Asset ID</TableHead>
                        <TableHead className="text-muted-foreground">Name</TableHead>
                        <TableHead className="text-muted-foreground">Category</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Location</TableHead>
                        <TableHead className="text-muted-foreground">Assigned To</TableHead>
                        <TableHead className="text-muted-foreground">Purchase Date</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {currentAssets.map((asset) => (
                        <TableRow key={asset.id} className="hover:bg-muted/50 border-border">
                        <TableCell className="hidden sm:table-cell p-2">
                            <Image
                                alt={asset.name || "Asset image"}
                                className="aspect-square rounded-md object-cover border border-border"
                                height="48"
                                src={asset.image || `https://placehold.co/48x48.png`}
                                width="48"
                                data-ai-hint={asset.dataAiHint || 'asset'}
                                onError={(e) => e.currentTarget.src = `https://placehold.co/48x48.png`}
                            />
                            </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground/80 py-2 px-3">{asset.id}</TableCell>
                        <TableCell className="text-foreground font-medium py-2 px-3">{asset.name}</TableCell>
                        <TableCell className="text-muted-foreground py-2 px-3">{asset.category}</TableCell>
                        <TableCell className="py-2 px-3">
                            <Badge 
                                variant={asset.status === 'Active' ? 'default' : asset.status === 'In Repair' ? 'secondary' : 'outline'}
                                className={
                                    asset.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700' :
                                    asset.status === 'In Repair' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700' :
                                    asset.status === 'Maintenance' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700' :
                                    'text-muted-foreground border-border'
                                }>
                            {asset.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground py-2 px-3">{asset.location || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground py-2 px-3">{asset.assignedTo || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground py-2 px-3">{asset.purchaseDate ? (asset.purchaseDate instanceof Date ? asset.purchaseDate.toLocaleDateString() : String(asset.purchaseDate)) : 'N/A'}</TableCell>
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
                                <DropdownMenuItem onClick={() => handleViewDetails(asset)} className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditAsset(asset)} className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">Edit</DropdownMenuItem>
                                <DropdownMenuItem className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">Assign</DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive hover:!bg-destructive/10 hover:!text-destructive"
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
            )}
        </CardContent>
      </Card>

      <AssetFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSaveAsset}
          assetData={editingAsset}
          availableCategories={availableCategories}
      />

      <AssetDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        assetData={assetForDetail}
      />

      <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          itemName={assetToDelete?.name || 'this asset'}
      />
    </div>
  );
}
