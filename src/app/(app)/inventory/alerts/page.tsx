
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { BellRing, PackageCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase/config';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  type Timestamp,
} from 'firebase/firestore';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePathname } from 'next/navigation';

interface StockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  cost?: number | null;
  location?: string;
  description?: string;
  image?: string;
  dataAiHint?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export default function LowStockAlertsPage() {
  const pathname = usePathname();
  const [allStockItems, setAllStockItems] = useState<StockItem[]>([]);
  const [lowStockAlertItems, setLowStockAlertItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchStockItems = useCallback(() => {
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
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching stock items for alerts:", error);
      toast({ title: "Error", description: "Could not fetch stock items.", variant: "destructive" });
      setIsLoading(false);
    });

    return unsubscribe;
  }, [toast]);

  useEffect(() => {
    const unsubscribe = fetchStockItems();
    return () => unsubscribe();
  }, [fetchStockItems]);

  useEffect(() => {
    // Client-side filtering for low stock items
    const filtered = allStockItems.filter(item => item.quantity <= item.reorderLevel && item.quantity > 0); // quantity > 0 to exclude out of stock
    const outOfStock = allStockItems.filter(item => item.quantity === 0);
    // Prioritize showing low stock, then out of stock if no low stock found, or combine them
    // For this example, let's show items strictly matching quantity <= reorderLevel
    setLowStockAlertItems(filtered); 
  }, [allStockItems]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue={pathname} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card border-b-0 mb-4 rounded-lg">
          <TabsTrigger value="/inventory/stock" asChild className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground data-[state=active]:shadow-sm hover:bg-muted/50">
            <Link href="/inventory/stock">Stock</Link>
          </TabsTrigger>
          <TabsTrigger value="/inventory/movements" asChild className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground data-[state=active]:shadow-sm hover:bg-muted/50">
            <Link href="/inventory/movements">Movements</Link>
          </TabsTrigger>
          <TabsTrigger value="/inventory/alerts" asChild className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground data-[state=active]:shadow-sm hover:bg-muted/50">
            <Link href="/inventory/alerts">Alerts</Link>
          </TabsTrigger>
          <TabsTrigger value="/inventory/reports" asChild className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground data-[state=active]:shadow-sm hover:bg-muted/50">
            <Link href="/inventory/reports">Reports</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

       <div className="flex items-center justify-between">
         <h1 className="text-2xl font-semibold leading-none tracking-tight">
           Low Stock Alerts
         </h1>
         <Button size="sm" variant="outline" asChild>
            <Link href="/settings/notifications">Configure Alerts</Link>
         </Button>
       </div>

       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2"><BellRing className="h-5 w-5 text-orange-500 dark:text-orange-400"/> Items Below Reorder Level</CardTitle>
           <CardDescription className="text-muted-foreground">These items require attention and possibly reordering.</CardDescription>
         </CardHeader>
         <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading stock levels...</p>
            </div>
           ) : (
           <Table>
             <TableCaption className="text-muted-foreground">Inventory items at or below their set reorder level.</TableCaption>
             <TableHeader>
               <TableRow>
                  <TableHead className="hidden w-[64px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                 <TableHead className="text-muted-foreground">Name (SKU)</TableHead>
                 <TableHead className="text-muted-foreground">Current Quantity</TableHead>
                 <TableHead className="text-muted-foreground">Reorder Level</TableHead>
                 <TableHead className="text-muted-foreground">Location</TableHead>
                 <TableHead><span className="sr-only">Actions</span></TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
              {lowStockAlertItems.length > 0 ? (
                 lowStockAlertItems.map((item) => (
                   <TableRow key={item.id} className="bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-800/30 border-orange-200 dark:border-orange-700/50">
                     <TableCell className="hidden sm:table-cell p-2">
                        <Image
                          alt={item.name || "Item image"}
                          className="aspect-square rounded-md object-cover border border-border"
                          height="40"
                          src={item.image || 'https://placehold.co/40x40.png'}
                          width="40"
                          data-ai-hint={item.dataAiHint || 'inventory item'}
                          onError={(e) => e.currentTarget.src = `https://placehold.co/40x40.png`}
                        />
                      </TableCell>
                     <TableCell className="font-medium text-foreground">{item.name} <span className="text-xs text-muted-foreground">({item.sku})</span></TableCell>
                     <TableCell className="font-bold text-orange-600 dark:text-orange-400">{item.quantity}</TableCell>
                     <TableCell className="text-foreground">{item.reorderLevel}</TableCell>
                     <TableCell className="text-muted-foreground">{item.location || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="border-input hover:bg-accent hover:text-accent-foreground">Reorder</Button>
                      </TableCell>
                   </TableRow>
                 ))
               ) : (
                 <TableRow>
                   <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                     <PackageCheck className="h-12 w-12 mx-auto mb-2 text-green-500 dark:text-green-400"/>
                      All stock levels are currently above their reorder points.
                   </TableCell>
                 </TableRow>
               )}
             </TableBody>
           </Table>
           )}
         </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Displaying <strong>{lowStockAlertItems.length}</strong> items needing attention.
            </div>
         </CardFooter>
       </Card>

       <p className="text-sm text-muted-foreground">
         Automated notifications for inventory thresholds are configured in Settings.
       </p>
     </div>
  );
}

    