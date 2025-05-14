
'use client';

import { useEffect, useState } from 'react';
import { Package, Users, DollarSign, Wrench, Loader2 } from 'lucide-react';
import { SampleDataGrid } from '@/components/sample-data-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { db } from '@/lib/firebase/config';
import { collection, getCountFromServer, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';

interface DashboardStats {
  assetCount: number | null;
  clientCount: number | null;
  inventoryValue: number | null;
  openServicesCount: number | null;
}

export default function DashboardPage() {
  const { isFirebaseConfigured } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    assetCount: null,
    clientCount: null,
    inventoryValue: null,
    openServicesCount: 0, // Placeholder, as services are not fully implemented
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      // Optionally set stats to error indicators or leave as null
      setStats({ assetCount: -1, clientCount: -1, inventoryValue: -1, openServicesCount: -1 });
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch Asset Count
        const assetsCollectionRef = collection(db, 'assets');
        const assetSnapshot = await getCountFromServer(assetsCollectionRef);
        const fetchedAssetCount = assetSnapshot.data().count;

        // Fetch Active Client Count
        const clientsCollectionRef = collection(db, 'clients');
        const activeClientsQuery = query(clientsCollectionRef, where('status', '==', 'Active'));
        const clientSnapshot = await getCountFromServer(activeClientsQuery);
        const fetchedClientCount = clientSnapshot.data().count;

        // Fetch Inventory Value
        const inventoryItemsCollectionRef = collection(db, 'inventoryItems');
        const inventorySnapshot = await getDocs(inventoryItemsCollectionRef);
        let totalValue = 0;
        inventorySnapshot.forEach(doc => {
          const item = doc.data();
          if (item.cost && item.quantity) {
            totalValue += Number(item.cost) * Number(item.quantity);
          }
        });
        const fetchedInventoryValue = totalValue;
        
        // Placeholder for Open Services - replace with actual logic when services are implemented
        const fetchedOpenServicesCount = 0; 

        setStats({
          assetCount: fetchedAssetCount,
          clientCount: fetchedClientCount,
          inventoryValue: fetchedInventoryValue,
          openServicesCount: fetchedOpenServicesCount,
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set stats to an error state or keep null to show skeletons
        setStats({ assetCount: -1, clientCount: -1, inventoryValue: -1, openServicesCount: -1 });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isFirebaseConfigured]);

  const renderStat = (value: number | null, unit: string = '') => {
    if (loading) return <Skeleton className="h-7 w-20" />;
    if (value === null || value === -1) return <span className="text-muted-foreground">N/A</span>;
    return (
      <div className="text-2xl font-bold transition-all duration-300">
        {unit}{value.toLocaleString()}
      </div>
    );
  };

  return (
    <>
      <h1 className="text-2xl font-semibold leading-none tracking-tight mb-6">
        Dashboard Overview
      </h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderStat(stats.assetCount)}
            {/* <p className="text-xs text-muted-foreground">
              +2 since last month
            </p> */}
          </CardContent>
        </Card>
         
          <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
             <Users className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             {renderStat(stats.clientCount)}
             {/* <p className="text-xs text-muted-foreground">+5 this quarter</p> */}
           </CardContent>
         </Card>
          <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
             <DollarSign className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             {renderStat(stats.inventoryValue, '$')}
             <p className="text-xs text-muted-foreground">Value based on cost</p>
           </CardContent>
         </Card>
          <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Open Services</CardTitle>
             <Wrench className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             {renderStat(stats.openServicesCount)}
             <p className="text-xs text-muted-foreground">Awaiting action</p>
           </CardContent>
         </Card>
      </div>
      {isFirebaseConfigured ? <SampleDataGrid /> : 
        <div className="text-center py-10 text-muted-foreground">
          Sample data grid is unavailable as Firebase is not configured. Dashboard stats may also be affected.
        </div>
      }
    </>
  );
}
