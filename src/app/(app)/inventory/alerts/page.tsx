import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { BellRing, PackageCheck } from "lucide-react";

const lowStockItems = [
  { id: 'SKU002', name: 'USB Keyboard', category: 'Peripherals', quantity: 5, reorderLevel: 15, location: 'Shelf A2', image: 'https://picsum.photos/40/40?random=2', dataAiHint: 'keyboard computer' },
   { id: 'SKU003', name: '24" Monitor', category: 'Displays', quantity: 20, reorderLevel: 5, location: 'Shelf B1', image: 'https://picsum.photos/40/40?random=3', dataAiHint: 'monitor screen' }, // Should not be here based on numbers, but adding for demo diversity
   { id: 'SKU005', name: 'Webcam HD', category: 'Peripherals', quantity: 12, reorderLevel: 10, location: 'Shelf A1', image: 'https://picsum.photos/40/40?random=5', dataAiHint: 'webcam camera' }, // Should not be here
];

// Filtered list for actual display
const filteredLowStock = lowStockItems.filter(item => item.quantity <= item.reorderLevel);


export default function LowStockAlertsPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
         <h1 className="text-2xl font-semibold leading-none tracking-tight">
           Low Stock Alerts
         </h1>
         <Button size="sm" variant="outline">Configure Alerts</Button>
       </div>

       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2"><BellRing className="h-5 w-5 text-orange-500"/> Items Below Reorder Level</CardTitle>
           <CardDescription>These items require attention and possibly reordering.</CardDescription>
         </CardHeader>
         <CardContent>
           <Table>
             <TableCaption>Inventory items at or below their set reorder level.</TableCaption>
             <TableHeader>
               <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                 <TableHead>Name (SKU)</TableHead>
                 <TableHead>Current Quantity</TableHead>
                 <TableHead>Reorder Level</TableHead>
                 <TableHead>Location</TableHead>
                 <TableHead><span className="sr-only">Actions</span></TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
              {filteredLowStock.length > 0 ? (
                 filteredLowStock.map((item) => (
                   <TableRow key={item.id} className="bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30">
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
                     <TableCell className="font-medium">{item.name} ({item.id})</TableCell>
                     <TableCell className="font-bold text-orange-600">{item.quantity}</TableCell>
                     <TableCell>{item.reorderLevel}</TableCell>
                     <TableCell>{item.location}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">Reorder</Button>
                      </TableCell>
                   </TableRow>
                 ))
               ) : (
                 <TableRow>
                   <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                     <PackageCheck className="h-12 w-12 mx-auto mb-2 text-green-500"/>
                      All stock levels are currently above the reorder point.
                   </TableCell>
                 </TableRow>
               )}
             </TableBody>
           </Table>
         </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Displaying <strong>{filteredLowStock.length}</strong> items needing attention.
            </div>
         </CardFooter>
       </Card>

       <p className="text-sm text-muted-foreground">
         Automated notifications for inventory thresholds. Configuration options available in Settings. Audit logs and role-based access are applied.
       </p>
     </div>
  );
}
