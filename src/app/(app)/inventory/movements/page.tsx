import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpCircle, ArrowDownCircle, Package, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"; // Assuming this component exists

const movements = [
  { id: 'MOV001', date: '2024-07-20', type: 'Inbound', item: 'Wireless Mouse (SKU001)', quantity: 50, sourceDest: 'Supplier X', user: 'Admin' },
  { id: 'MOV002', date: '2024-07-19', type: 'Outbound', item: 'USB Keyboard (SKU002)', quantity: 5, sourceDest: 'Client A', user: 'Sales' },
  { id: 'MOV003', date: '2024-07-18', type: 'Adjustment', item: '24" Monitor (SKU003)', quantity: -1, sourceDest: 'Damaged', user: 'Admin' },
  { id: 'MOV004', date: '2024-07-17', type: 'Transfer', item: 'Laptop Stand (SKU004)', quantity: 10, sourceDest: 'Warehouse B -> A', user: 'Logistics' },
  { id: 'MOV005', date: '2024-07-16', type: 'Inbound', item: 'Webcam HD (SKU005)', quantity: 20, sourceDest: 'Supplier Y', user: 'Admin' },
];

export default function StockMovementsPage() {
  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         <h1 className="text-2xl font-semibold leading-none tracking-tight">
           Stock Movements
         </h1>
         <div className="flex gap-2 items-center w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search movements (item, user...)"
              className="pl-8 sm:w-[300px]"
            />
          </div>
          <Button size="sm">Export Log</Button>
          <Button size="sm">Record Movement</Button>
         </div>
       </div>

       {/* Filters */}
       <Card>
         <CardHeader>
            <CardTitle>Filter Movements</CardTitle>
         </CardHeader>
         <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <div>
              <label htmlFor="item-filter" className="text-sm font-medium mb-1 block">Item (SKU)</label>
               <Input id="item-filter" placeholder="e.g., SKU001" />
           </div>
            <div>
              <label htmlFor="type-filter" className="text-sm font-medium mb-1 block">Movement Type</label>
              <Select>
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">All Types</SelectItem>
                   <SelectItem value="inbound">Inbound</SelectItem>
                   <SelectItem value="outbound">Outbound</SelectItem>
                   <SelectItem value="transfer">Transfer</SelectItem>
                   <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
           </div>
            <div>
              <label htmlFor="user-filter" className="text-sm font-medium mb-1 block">User</label>
               <Input id="user-filter" placeholder="e.g., Admin" />
           </div>
           {/* <div>
              <label htmlFor="date-range-filter" className="text-sm font-medium mb-1 block">Date Range</label>
             <DatePickerWithRange id="date-range-filter" />
           </div> */}
           <div className="flex items-end">
             <Button className="w-full lg:w-auto">Apply Filters</Button>
           </div>
         </CardContent>
       </Card>

       <Card>
         <CardHeader>
           <CardTitle>Movement Log</CardTitle>
           <CardDescription>Monitor incoming and outgoing inventory changes.</CardDescription>
         </CardHeader>
         <CardContent>
           <Table>
             <TableCaption>Detailed log of all inventory movements.</TableCaption>
             <TableHeader>
               <TableRow>
                 <TableHead>Date</TableHead>
                 <TableHead>Type</TableHead>
                 <TableHead>Item</TableHead>
                 <TableHead className="text-right">Quantity</TableHead>
                 <TableHead>Source / Destination</TableHead>
                 <TableHead>User</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {movements.map((mov) => (
                 <TableRow key={mov.id}>
                   <TableCell className="text-muted-foreground">{mov.date}</TableCell>
                   <TableCell>
                     <Badge variant="outline" className="gap-1">
                        {mov.type === 'Inbound' && <ArrowDownCircle className="h-3 w-3 text-green-600" />}
                        {mov.type === 'Outbound' && <ArrowUpCircle className="h-3 w-3 text-red-600" />}
                         {mov.type === 'Transfer' && <ArrowRightLeft className="h-3 w-3 text-blue-600" />}
                          {mov.type === 'Adjustment' && <Settings className="h-3 w-3 text-orange-600" />}
                       {mov.type}
                     </Badge>
                   </TableCell>
                   <TableCell className="font-medium flex items-center gap-1"><Package className="h-3 w-3 text-muted-foreground"/>{mov.item}</TableCell>
                    <TableCell className={`text-right font-medium ${mov.quantity > 0 ? 'text-green-600' : mov.quantity < 0 ? 'text-red-600' : ''}`}>
                       {mov.quantity > 0 ? '+' : ''}{mov.quantity}
                     </TableCell>
                   <TableCell>{mov.sourceDest}</TableCell>
                    <TableCell className="flex items-center gap-1"><User className="h-3 w-3 text-muted-foreground"/>{mov.user}</TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>1-5</strong> of <strong>{movements.length}</strong> movements
            </div>
         </CardFooter>
       </Card>

       <p className="text-sm text-muted-foreground">
         Monitor incoming and outgoing inventory with detailed logs and filtering. Audit logs and role-based access are applied.
       </p>
     </div>
  );
}
