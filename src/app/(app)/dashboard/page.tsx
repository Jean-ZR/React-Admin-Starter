
'use client';

import { useEffect, useState } from 'react';
import { Truck, Users, Wrench, Package as PackageIcon, BarChart3, PieChart as PieChartIcon, ListChecks } from 'lucide-react'; // Renamed Package to PackageIcon
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase/config';
import { collection, getCountFromServer, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';

interface DashboardStatCard {
  title: string;
  value: string | null; // Can be null while loading or if N/A
  icon: React.ElementType;
  color: string; // Tailwind background color class e.g., 'bg-blue-600'
  change?: string; // Optional e.g., "+12%"
  changeColor?: string; // Optional e.g., 'text-green-500' or 'text-red-500'
  unit?: string; // Optional unit like '$'
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

export default function DashboardPage() {
  const { isFirebaseConfigured } = useAuth();
  const [stats, setStats] = useState<DashboardStatCard[]>([
    // Initial structure for skeletons
    { title: "Total Activos", value: null, icon: Truck, color: "bg-blue-600", change: "", changeColor: "text-green-500" },
    { title: "Clientes Activos", value: null, icon: Users, color: "bg-sky-600", change: "", changeColor: "text-green-500" },
    { title: "Servicios Abiertos", value: null, icon: Wrench, color: "bg-amber-600", change: "", changeColor: "text-green-500" },
    { title: "Valor Inventario", value: null, icon: PackageIcon, unit: "$", color: "bg-green-600", change: "", changeColor: "text-green-500" },
  ]);
  const [assetStatusDistribution, setAssetStatusDistribution] = useState<AssetStatusDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      // Update stats to show N/A or error indication
      setStats(prev => prev.map(s => ({ ...s, value: "N/A" })));
      setAssetStatusDistribution([]);
      return;
    }

    const fetchDashboardData = async () => {
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

        // Placeholder for services count, as it's not fully implemented
        const openServicesCount = 0; 

        // Fetch Asset Status Distribution
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

        setStats([
          { title: "Total Activos", value: assetsSnap.data().count.toLocaleString(), icon: Truck, color: "bg-blue-600", change: "+12%", changeColor: "text-green-500" }, // Example change
          { title: "Clientes Activos", value: clientsSnap.data().count.toLocaleString(), icon: Users, color: "bg-sky-600", change: "+8%", changeColor: "text-green-500" },
          { title: "Servicios Abiertos", value: openServicesCount.toLocaleString(), icon: Wrench, color: "bg-amber-600", change: "+5%", changeColor: "text-green-500" },
          { title: "Valor Inventario", value: totalValue.toLocaleString(), unit: "$", icon: PackageIcon, color: "bg-green-600", change: "+15%", changeColor: "text-green-500" },
        ]);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setStats(prev => prev.map(s => ({ ...s, value: "Error" })));
        setAssetStatusDistribution([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isFirebaseConfigured]);

  return (
    <>
      {/* Stats Grid - new design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            {loading ? (
              <>
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-10 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </>
            ) : (
              <>
                <div className="flex justify-between items-start mb-3">
                  <div className="text-slate-500 text-sm font-medium">{stat.title}</div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${stat.color} shadow-md`}>
                    <stat.icon size={20} />
                  </div>
                </div>
                <div className="flex items-baseline">
                  <div className="text-3xl font-bold text-slate-800 mr-2">
                    {stat.unit}{stat.value}
                  </div>
                  {stat.change && <div className={`text-xs font-semibold ${stat.changeColor || 'text-green-500'}`}>{stat.change}</div>}
                </div>
                 <p className="text-xs text-slate-400 mt-1">Actualizado recientemente</p> 
              </>
            )}
          </div>
        ))}
      </div>

      {/* Charts and Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <PieChartIcon className="h-5 w-5 text-primary" /> Distribución de Activos
            </CardTitle>
            <CardDescription className="text-slate-500">Por estado actual.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {loading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : assetStatusDistribution.length > 0 ? (
              <ChartContainer config={chartConfig} className="w-full h-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
                  <Pie data={assetStatusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {assetStatusDistribution.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.fill} className="focus:outline-none" />
                    ))}
                  </Pie>
                  <Legend content={({ payload }) => (
                    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3 text-xs text-slate-600">
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
              <p className="text-slate-500 italic">No hay datos de estado de activos.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <ListChecks className="h-5 w-5 text-primary" /> Actividad Reciente
            </CardTitle>
            <CardDescription className="text-slate-500">Últimas actualizaciones en el sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : mockRecentActivity.length > 0 ? (
              <ul className="divide-y divide-slate-200">
                {mockRecentActivity.map((activity) => (
                  <li key={activity.id} className="py-3.5 first:pt-0 last:pb-0">
                    <p className="text-sm font-medium text-slate-700">{activity.description}</p>
                    <p className="text-xs text-slate-500">
                      Por {activity.user} - {activity.time}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">No hay actividad reciente para mostrar.</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Placeholder for active module content as per new design */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-slate-700">
          Módulo Activo: <span className="text-primary capitalize">{ (typeof window !== "undefined" && window.location.pathname.split('/')[1]) || 'dashboard' }</span>
        </h2>
        <p className="text-slate-600">El contenido específico del módulo seleccionado se mostraría aquí.</p>
        {!isFirebaseConfigured && 
          <p className="mt-4 text-sm text-red-600">
            Nota: Firebase no está configurado. Los datos dinámicos y la funcionalidad completa pueden no estar disponibles.
          </p>
        }
      </div>
    </>
  );
}
