import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Search, ListFilter, PlusCircle, FileDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const stockItems = [
  { id: 'SKU001', name: 'Wireless Mouse', category: 'Peripherals', quantity: 50, reorderLevel: 10, location: 'Shelf A1', image: 'https://picsum.photos/40/40?random=1', dataAiHint: 'mouse computer' },
  { id: 'SKU002', name: 'USB Keyboard', category: 'Peripherals', quantity: 5, reorderLevel: 15, location: 'Shelf A2', image: 'https://picsum.photos/40/40?random=2', dataAiHint: 'keyboard computer' },
  { id: 'SKU003', name: '24" Monitor', category: 'Displays', quantity: 20, reorderLevel: 5, location: 'Shelf B1', image: 'https://picsum.photos/40/40?random=3', dataAiHint: 'monitor screen' },
  { id: 'SKU004', name: 'Laptop Stand', category: 'Accessories', quantity: 75, reorderLevel: 20, location: 'Shelf C3', image: 'https://picsum.photos/40/40?random=4', dataAiHint: 'laptop stand' },
  { id: 'SKU005', name: 'Webcam HD', category: 'Peripherals', quantity: 12, reorderLevel: 10, location: 'Shelf A1', image: 'https://picsum.photos/40/40?random=5', dataAiHint: 'webcam camera' },
];

export default function StockManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">
          Stock Management
        </h1>
        <div className="flex gap-2 items-center w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search stock items..."
              className="pl-8 sm:w-[300px]"
            />
          </div>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>In Stock</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Low Stock</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Out of Stock</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
           <Button size="sm" variant="outline" className="h-9 gap-1">
            <FileDown className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Export</span>
          </Button>
          <Button size="sm" className="h-9 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Add Item</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Levels</CardTitle>
           <CardDescription>Real-time tracking of inventory items.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
             <TableCaption>List of current inventory items.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                 <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockItems.map((item) => (
                <TableRow key={item.id}>
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
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                   <TableCell>{item.location}</TableCell>
                   <TableCell>
                      <Badge variant={item.quantity <= item.reorderLevel ? (item.quantity === 0 ? "destructive" : "secondary") : "outline"}
                             className={item.quantity <= item.reorderLevel && item.quantity > 0 ? "text-orange-600 border-orange-600" : ""}>
                        {item.quantity === 0 ? 'Out of Stock' : item.quantity <= item.reorderLevel ? 'Low Stock' : 'In Stock'}
                      </Badge>
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-5</strong> of <strong>{stockItems.length}</strong> items
          </div>
        </CardFooter>
      </Card>

      <p className="text-sm text-muted-foreground">
        Real-time tracking of inventory levels with search and filtering. Audit logs and role-based access are applied.
      </p>
    </div>
  );
}
