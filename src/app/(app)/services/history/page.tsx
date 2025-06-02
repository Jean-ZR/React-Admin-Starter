
'use client'; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ListFilter, FileDown, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// Removed Tabs, TabsList, TabsTrigger, Link, usePathname

const serviceHistory = [
  { id: 'SRV1023', dateOpened: '2024-07-15', client: 'Alpha Corp', service: 'Network issue', technician: 'John Doe', status: 'Closed', dateClosed: '2024-07-16' },
  { id: 'SRV1022', dateOpened: '2024-07-12', client: 'Beta Industries', service: 'Software Installation', technician: 'Jane Smith', status: 'Closed', dateClosed: '2024-07-12' },
  { id: 'SRV1021', dateOpened: '2024-07-10', client: 'Alpha Corp', service: 'Printer Setup', technician: 'John Doe', status: 'Closed', dateClosed: '2024-07-10' },
  { id: 'SRV1020', dateOpened: '2024-06-28', client: 'Gamma Solutions', service: 'Software install', technician: 'Jane Smith', status: 'In Progress', dateClosed: null },
  { id: 'SRV1019', dateOpened: '2024-06-15', client: 'Beta Industries', service: 'Server Maintenance', technician: 'John Doe', status: 'Closed', dateClosed: '2024-06-15' },
];

export default function ServiceHistoryPage() {

    const handleExport = () => {
        console.log("Exporting service history..."); 
        alert("Export functionality not yet implemented.");
    };

  return (
    <div className="space-y-6">
       {/* Removed Tabs navigation - now handled by sidebar accordion */}
       <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         {/* Title is now handled by layout.tsx */}
         <div className="flex-1"></div> {/* Spacer */}
          <div className="flex gap-2 items-center w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search history (ID, client, service...)"
              className="pl-8 sm:w-[300px] bg-background border-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1 text-muted-foreground hover:text-foreground border-input hover:bg-accent">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border"/>
              <DropdownMenuCheckboxItem className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">Open</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">In Progress</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">On Hold</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">Closed</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
           <Button size="sm" variant="outline" className="h-9 gap-1 text-muted-foreground hover:text-foreground border-input hover:bg-accent" onClick={handleExport}>
            <FileDown className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Export</span>
          </Button>
        </div>
       </div>

       <Card className="bg-card text-card-foreground border-border">
         <CardHeader>
           <CardTitle className="text-foreground">Service Record Log</CardTitle>
           <CardDescription className="text-muted-foreground">Track service delivery and maintenance records.</CardDescription>
         </CardHeader>
         <CardContent>
           <Table>
             <TableCaption className="text-muted-foreground">Historical record of all service requests.</TableCaption>
             <TableHeader>
               <TableRow className="border-border">
                 <TableHead className="text-muted-foreground">Ticket ID</TableHead>
                 <TableHead className="text-muted-foreground">Client</TableHead>
                 <TableHead className="text-muted-foreground">Service</TableHead>
                 <TableHead className="text-muted-foreground">Technician</TableHead>
                 <TableHead className="text-muted-foreground">Date Opened</TableHead>
                  <TableHead className="text-muted-foreground">Date Closed</TableHead>
                 <TableHead className="text-muted-foreground">Status</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {serviceHistory.map((record) => (
                 <TableRow key={record.id} className="border-border hover:bg-muted/50">
                   <TableCell className="font-mono text-xs text-muted-foreground">{record.id}</TableCell>
                   <TableCell className="font-medium text-foreground">{record.client}</TableCell>
                   <TableCell className="text-foreground">{record.service}</TableCell>
                   <TableCell className="text-foreground">{record.technician}</TableCell>
                   <TableCell className="text-muted-foreground">{record.dateOpened}</TableCell>
                    <TableCell className="text-muted-foreground">{record.dateClosed || 'N/A'}</TableCell>
                   <TableCell>
                     <Badge variant={record.status === 'Closed' ? 'default' : 'outline'}
                            className={`gap-1 ${
                                record.status === 'Closed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700' : 
                                record.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700' : 
                                'text-muted-foreground border-border'
                            }`}>
                        {record.status === 'Closed' && <CheckCircle className="h-3 w-3" />}
                        {record.status === 'In Progress' && <Clock className="h-3 w-3" />}
                        {record.status !== 'Closed' && record.status !== 'In Progress' && <AlertCircle className="h-3 w-3" />}
                       {record.status}
                     </Badge>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </CardContent>
          <CardFooter className="border-t border-border pt-4">
            <div className="text-xs text-muted-foreground">
              Showing <strong>1-{serviceHistory.length}</strong> of <strong>{serviceHistory.length}</strong> records
            </div>
         </CardFooter>
       </Card>

       <p className="text-sm text-muted-foreground">
         Track service delivery and maintenance records with search and filtering. Audit logs and role-based access are applied.
       </p>
     </div>
  );
}
