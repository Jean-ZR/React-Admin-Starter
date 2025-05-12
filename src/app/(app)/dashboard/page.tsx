import { Package, Users, DollarSign, Wrench } from 'lucide-react'; // Added Users, DollarSign, Wrench
import { SampleDataGrid } from '@/components/sample-data-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold leading-none tracking-tight mb-6">
        Dashboard Overview
      </h1>
      {/* Example Placeholder Card */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              +2 since last month
            </p>
          </CardContent>
        </Card>
         {/* Add more placeholder cards if needed */}
          <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
             <Users className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">12</div>
             <p className="text-xs text-muted-foreground">+5 this quarter</p>
           </CardContent>
         </Card>
          <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
             <DollarSign className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">$15,231</div>
             <p className="text-xs text-muted-foreground">Value based on cost</p>
           </CardContent>
         </Card>
          <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Open Services</CardTitle>
             <Wrench className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">3</div>
             <p className="text-xs text-muted-foreground">Awaiting action</p>
           </CardContent>
         </Card>
      </div>
      <SampleDataGrid />
    </>
  );
}
