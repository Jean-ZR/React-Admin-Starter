
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Truck, Users, Wrench, Package as PackageIcon, BarChart3, PieChart as PieChartIcon, ListChecks, PlusCircle, Settings, FileText, Users2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase/config';
import { collection, getCountFromServer, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';

interface DashboardStatCard {
  title: string;
  value: string | null;
  icon: React.ElementType;
  iconColor?: string; // More specific color for icon itself
  bgColor?: string; // Specific background for icon container
  change?: string; 
  changeColor?: string; 
  unit?: string; 
  href?: string; // Optional link for the card
}

interface Asset {
  id: string;
  status: string;
  category: string;
}

interface AssetStatusDistribution {
  name: string;
  value: number;
  fill: string;
}

const STATUS_COLORS: { [key: string]: string } = {
  Active: 'hsl(var(--chart-1))',
  'In Repair': 'hsl(var(--chart-2))',
  Inactive: 'hsl(var(--chart-3))',
  Disposed: 'hsl(var(--chart-4))',
  Maintenance: 'hsl(var(--chart-5))',
  Unknown: 'hsl(var(--muted))',
};

const chartConfig = {
  assets: { label: "Assets" },
  Active: { label: "Activo", color: "hsl(var(--chart-1))" },
  "In Repair": { label: "En Reparación", color: "hsl(var(--chart-2))" },
  Inactive: { label: "Inactivo", color: "hsl(var(--chart-3))" },
  Disposed: { label: "Desechado", color: "hsl(var(--chart-4))" },
  Maintenance: { label: "Mantenimiento", color: "hsl(var(--chart-5))" },
  Unknown: { label: "Desconocido", color: "hsl(var(--muted))" },
} satisfies ChartConfig;

const mockRecentActivity = [
  { id: 1, description: "Nuevo activo 'Laptop Pro 16' añadido.", user: "Admin", time: "Hace 2 horas" },
  { id: 2, description: "Cliente 'Beta Industries' actualizado a 'Activo'.", user: "Jane D.", time: "Hace 5 horas" },
  { id: 3, description: "Item de inventario 'SKU004' cantidad actualizada.", user: "Sistema", time: "Hace 1 día" },
  { id: 4, description: "Reporte 'Finanzas Mensuales' generado.", user: "Admin", time: "Hace 2 días" },
];

const quickActions = [
    { label: "Añadir Activo", href: "/assets/list", icon: Truck }, // Will open modal from list page
    { label: "Añadir Cliente", href: "/clients/directory", icon: Users2 }, // Will open modal from list page
    { label: "Registrar Movimiento", href: "/inventory/movements", icon: PackageIcon }, // Will open modal from movements page
    { label: "Nuevo Reporte", href: "/reports/custom", icon: FileText },
];

export default function DashboardPage() {
  const { user, isFirebaseConfigured } = useAuth();
  const [stats, setStats] = useState<DashboardStatCard[]>([
    { title: "Total Activos", value: null, icon: Truck, iconColor: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/30", change: "", href: "/assets/list" },
    { title: "Clientes Activos", value: null, icon: Users, iconColor: "text-sky-500", bgColor: "bg-sky-100 dark:bg-sky-900/30", change: "", href: "/clients/directory" },
    { title: "Servicios Abiertos", value: null, icon: Wrench, iconColor: "text-amber-500", bgColor: "bg-amber-100 dark:bg-amber-900/30", change: "", href: "/services/catalog" },
    { title: "Valor Inventario", value: null, icon: PackageIcon, unit: "$", iconColor: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/30", change: "", href: "/inventory/stock" },
  ]);
  const [assetStatusDistribution, setAssetStatusDistribution] = useState<AssetStatusDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/dashboard"; 

  const fetchDashboardData = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      setStats(prev => prev.map(s => ({ ...s, value: "N/A" })));
      setAssetStatusDistribution([]);
      return;
    }
    setLoading(true);
    try {
      const assetsSnap = await getCountFromServer(collection(db, 'assets'));
      const activeClientsQuery = query(collection(db, 'clients'), where('status', '==', 'Active'));
      const clientsSnap = await getCountFromServer(activeClientsQuery);
      
      const inventorySnap = await getDocs(collection(db, 'inventoryItems'));
      let totalValue = 0;
      inventorySnap.forEach(doc => {
        const item = doc.data();
        if (item.cost && item.quantity) {
          totalValue += Number(item.cost) * Number(item.quantity);
        }
      });

      const openServicesCount = 0; // Placeholder

      const allAssetsSnapshot = await getDocs(collection(db, 'assets'));
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

      setStats(prev => [
        { ...prev[0], value: assetsSnap.data().count.toLocaleString(), change: "+12%" },
        { ...prev[1], value: clientsSnap.data().count.toLocaleString(), change: "+8%" },
        { ...prev[2], value: openServicesCount.toLocaleString(), change: "+5%" },
        { ...prev[3], value: totalValue.toLocaleString(), change: "+15%" },
      ]);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setStats(prev => prev.map(s => ({ ...s, value: "Error" })));
      setAssetStatusDistribution([]);
    } finally {
      setLoading(false);
    }
  }, [isFirebaseConfigured]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const StatCardContent = ({ stat }: { stat: DashboardStatCard }) => (
    <div
      className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col justify-between min-h-[150px]"
    >
      {loading ? (
        <>
          <Skeleton className="h-4 w-2/3 mb-3 bg-muted" />
          <Skeleton className="h-10 w-1/2 mb-2 bg-muted" />
          <Skeleton className="h-4 w-1/4 bg-muted" />
        </>
      ) : (
        <>
          <div className="flex justify-between items-start mb-2">
            <div className="text-muted-foreground text-sm font-medium">{stat.title}</div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bgColor} shadow-md`}>
              <stat.icon size={20} className={stat.iconColor} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold text-foreground mr-2">
                {stat.unit}{stat.value}
              </div>
              {stat.change && <div className={`text-xs font-semibold ${stat.changeColor || 'text-green-500 dark:text-green-400'}`}>{stat.change}</div>}
            </div>
            <p className="text-xs text-muted-foreground/80 mt-1">Actualizado recientemente</p> 
          </div>
        </>
      )}
    </div>
  );


  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          stat.href ? (
            <Link href={stat.href} key={index} className="block">
              <StatCardContent stat={stat} />
            </Link>
          ) : (
            <StatCardContent key={index} stat={stat} />
          )
        ))}
      </div>

      {/* Charts and Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow duration-300 border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <PieChartIcon className="h-5 w-5 text-primary" /> Distribución de Activos
            </CardTitle>
            <CardDescription className="text-muted-foreground">Por estado actual.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center p-4">
            {loading ? (
              <Skeleton className="h-[300px] w-full bg-muted" />
            ) : assetStatusDistribution.length > 0 ? (
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
                    <Pie data={assetStatusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {assetStatusDistribution.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} className="focus:outline-none stroke-background hover:opacity-80" strokeWidth={2}/>
                      ))}
                    </Pie>
                    <Legend content={({ payload }) => (
                      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-xs text-muted-foreground">
                        {payload?.map((entry: any, index: number) => (
                          <div key={`item-${index}`} className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                            {entry.value} ({entry.payload.value})
                          </div>
                        ))}
                      </div>
                    )} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground italic">No hay datos de estado de activos.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
            <Card className="bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow duration-300 border-border">
                <CardHeader className="border-b border-border">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                    <PlusCircle className="h-5 w-5 text-primary" /> Acciones Rápidas
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 p-4">
                    {quickActions.map(action => (
                    <Button key={action.label} variant="outline" className="w-full justify-start text-sm h-11 border-input hover:bg-accent hover:text-accent-foreground" asChild>
                        <Link href={action.href}>
                        <action.icon className="mr-2 h-4 w-4" />
                        {action.label}
                        </Link>
                    </Button>
                    ))}
                </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow duration-300 border-border">
            <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2 text-foreground">
                <ListChecks className="h-5 w-5 text-primary" /> Actividad Reciente
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 max-h-[200px] overflow-y-auto">
                {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full bg-muted" />)}
                </div>
                ) : mockRecentActivity.length > 0 ? (
                <ul className="divide-y divide-border">
                    {mockRecentActivity.slice(0,3).map((activity) => ( // Show only 3 for space
                    <li key={activity.id} className="py-2.5 first:pt-0 last:pb-0">
                        <p className="text-sm font-medium text-foreground truncate">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                        Por {activity.user} - {activity.time}
                        </p>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-muted-foreground italic text-sm">No hay actividad reciente.</p>
                )}
            </CardContent>
            </Card>
        </div>
      </div>
      
      <Card className="bg-card text-card-foreground border-border shadow-sm mt-8">
        <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">
                Módulo Activo: <span className="text-primary capitalize">{pathname.split('/').pop() || 'dashboard' }</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Bienvenido de nuevo, {user?.displayName || user?.email || 'Usuario'}.</p>
            {!isFirebaseConfigured && 
            <p className="mt-4 text-sm text-destructive">
                Nota: Firebase no está configurado. Los datos dinámicos y la funcionalidad completa pueden no estar disponibles.
            </p>
            }
        </CardContent>
      </Card>
    </>
  );
}

