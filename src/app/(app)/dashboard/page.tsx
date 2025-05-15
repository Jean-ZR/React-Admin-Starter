
'use client';

import { useEffect, useState } from 'react';
import { Package, Users, DollarSign, Wrench, ListChecks, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { SampleDataGrid } from '@/components/sample-data-grid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase/config';
import { collection, getCountFromServer, getDocs, query, where, type Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"


interface DashboardStats {
  assetCount: number | null;
  clientCount: number | null;
  inventoryValue: number | null;
  openServicesCount: number | null;
}

interface Asset {
  id: string;
  status: string;
  category: string;
  // Add other asset properties if needed for other charts
}

interface AssetStatusDistribution {
  name: string;
  value: number;
  fill: string;
}

const STATUS_COLORS: { [key: string]: string } = {
  Active: 'hsl(var(--chart-1))', // Greenish
  'In Repair': 'hsl(var(--chart-2))', // Yellowish/Orangish
  Inactive: 'hsl(var(--chart-3))', // Greyish
  Disposed: 'hsl(var(--chart-4))', // Reddish
  Maintenance: 'hsl(var(--chart-5))', // Bluish
  Unknown: 'hsl(var(--muted))',
};

const chartConfig = {
  assets: {
    label: "Assets",
  },
  Active: {
    label: "Active",
    color: "hsl(var(--chart-1))",
  },
  "In Repair": {
    label: "In Repair",
    color: "hsl(var(--chart-2))",
  },
  Inactive: {
    label: "Inactive",
    color: "hsl(var(--chart-3))",
  },
  Disposed: {
    label: "Disposed",
    color: "hsl(var(--chart-4))",
  },
  Maintenance: {
    label: "Maintenance",
    color: "hsl(var(--chart-5))",
  },
   Unknown: {
    label: "Unknown",
    color: "hsl(var(--muted))",
  },
} satisfies ChartConfig


const mockRecentActivity = [
  { id: 1, description: "New asset 'Laptop Pro 16' added.", user: "Admin", time: "2 hours ago" },
  { id: 2, description: "Client 'Beta Industries' status updated to 'Active'.", user: "Jane D.", time: "5 hours ago" },
  { id: 3, description: "Inventory item 'SKU004' quantity updated.", user: "System", time: "1 day ago" },
  { id: 4, description: "Report 'Monthly Financials' generated.", user: "Admin", time: "2 days ago" },
];

export default function DashboardPage() {
  const { isFirebaseConfigured } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    assetCount: null,
    clientCount: null,
    inventoryValue: null,
    openServicesCount: 0,
  });
  const [assetStatusDistribution, setAssetStatusDistribution] = useState<AssetStatusDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      setStats({ assetCount: -1, clientCount: -1, inventoryValue: -1, openServicesCount: -1 });
      setAssetStatusDistribution([]);
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
        
        const fetchedOpenServicesCount = 0; // Placeholder

        // Fetch Asset Status Distribution
        const allAssetsSnapshot = await getDocs(assetsCollectionRef);
        const statuses: { [key: string]: number } = {};
        allAssetsSnapshot.forEach(doc => {
          const asset = doc.data() as Asset;
          statuses[asset.status] = (statuses[asset.status] || 0) + 1;
        });
        const statusData = Object.entries(statuses).map(([name, value]) => ({
          name,
          value,
          fill: STATUS_COLORS[name] || STATUS_COLORS.Unknown,
        }));
        setAssetStatusDistribution(statusData);

        setStats({
          assetCount: fetchedAssetCount,
          clientCount: fetchedClientCount,
          inventoryValue: fetchedInventoryValue,
          openServicesCount: fetchedOpenServicesCount,
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setStats({ assetCount: -1, clientCount: -1, inventoryValue: -1, openServicesCount: -1 });
        setAssetStatusDistribution([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isFirebaseConfigured]);

  const renderStat = (value: number | null, unit: string = '') => {
    if (loading) return <Skeleton className="h-10 w-24" />; // Adjusted skeleton size
    if (value === null || value === -1) return <span className="text-2xl font-bold text-muted-foreground">N/A</span>;
    return (
      <div className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
        {unit}{value.toLocaleString()}
      </div>
    );
  };

  return (
    <>
      <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground mb-8">
        Dashboard Overview
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="group hover:border-primary transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {renderStat(stats.assetCount)}
            <p className="text-xs text-muted-foreground pt-1">
              Currently tracked assets
            </p>
          </CardContent>
        </Card>
         
        <Card className="group hover:border-primary transition-all duration-300">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">Active Clients</CardTitle>
             <Users className="h-5 w-5 text-primary" />
           </CardHeader>
           <CardContent>
             {renderStat(stats.clientCount)}
             <p className="text-xs text-muted-foreground pt-1">Clients with active status</p>
           </CardContent>
         </Card>

        <Card className="group hover:border-primary transition-all duration-300">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
             <DollarSign className="h-5 w-5 text-primary" />
           </CardHeader>
           <CardContent>
             {renderStat(stats.inventoryValue, '$')}
             <p className="text-xs text-muted-foreground pt-1">Total value based on cost</p>
           </CardContent>
         </Card>

        <Card className="group hover:border-primary transition-all duration-300">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">Open Services</CardTitle>
             <Wrench className="h-5 w-5 text-primary" />
           </CardHeader>
           <CardContent>
             {renderStat(stats.openServicesCount)}
             <p className="text-xs text-muted-foreground pt-1">Services awaiting action</p>
           </CardContent>
         </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary"/> Asset Status Distribution
            </CardTitle>
            <CardDescription>Overview of assets by their current status.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : assetStatusDistribution.length > 0 ? (
                <ChartContainer config={chartConfig} className="w-full h-full">
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
                        <Pie data={assetStatusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                        {assetStatusDistribution.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                        ))}
                        </Pie>
                        <Legend content={({ payload }) => (
                            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4 text-xs">
                            {payload?.map((entry: any, index: number) => (
                                <div key={`item-${index}`} className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.value}
                                </div>
                            ))}
                            </div>
                        )} />
                    </PieChart>
                </ChartContainer>
            ) : (
              <p className="text-muted-foreground">No asset status data available.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary"/> Recent Activity
            </CardTitle>
            <CardDescription>Latest updates and actions in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : mockRecentActivity.length > 0 ? (
              <ul className="divide-y divide-border">
                {mockRecentActivity.map((activity) => (
                  <li key={activity.id} className="py-3">
                    <p className="text-sm font-medium text-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      By {activity.user} - {activity.time}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No recent activity to display.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {isFirebaseConfigured ? (
         <>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">Sample Asset Grid</h2>
          <SampleDataGrid />
         </>
      ) : 
        <div className="text-center py-10 text-muted-foreground">
          Sample data grid is unavailable as Firebase is not configured. Dashboard stats may also be affected.
        </div>
      }
    </>
  );
}
