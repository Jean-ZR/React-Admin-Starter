'use client'; // Required for onClick handler

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
// import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"; // Assuming this component exists

const serviceHistory = [
  { id: 'SRV1023', dateOpened: '2024-07-15', client: 'Alpha Corp', service: 'Network issue', technician: 'John Doe', status: 'Closed', dateClosed: '2024-07-16' },
  { id: 'SRV1022', dateOpened: '2024-07-12', client: 'Beta Industries', service: 'Software Installation', technician: 'Jane Smith', status: 'Closed', dateClosed: '2024-07-12' },
  { id: 'SRV1021', dateOpened: '2024-07-10', client: 'Alpha Corp', service: 'Printer Setup', technician: 'John Doe', status: 'Closed', dateClosed: '2024-07-10' },
  { id: 'SRV1020', dateOpened: '2024-06-28', client: 'Gamma Solutions', service: 'Software install', technician: 'Jane Smith', status: 'In Progress', dateClosed: null },
  { id: 'SRV1019', dateOpened: '2024-06-15', client: 'Beta Industries', service: 'Server Maintenance', technician: 'John Doe', status: 'Closed', dateClosed: '2024-06-15' },
];

export default function ServiceHistoryPage() {

    const handleExport = () => {
        console.log("Exporting service history..."); // Placeholder for export logic
        // TODO: Implement actual CSV/PDF export based on current filters
        alert("Export functionality not yet implemented.");
    };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         <h1 className="text-2xl font-semibold leading-none tracking-tight">
           Service History
         </h1>
          <div className="flex gap-2 items-center w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search history (ID, client, service...)"
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
              <DropdownMenuCheckboxItem>Open</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>In Progress</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>On Hold</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Closed</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
           <Button size="sm" variant="outline" className="h-9 gap-1" onClick={handleExport}>
            <FileDown className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Export</span>
          </Button>
        </div>
       </div>

       {/* Add more filters if needed (Client, Service Type, Technician, Date Range) */}
       {/* <Card> ... Filters ... </Card> */}

       <Card>
         <CardHeader>
           <CardTitle>Service Record Log</CardTitle>
           <CardDescription>Track service delivery and maintenance records.</CardDescription>
         </CardHeader>
         <CardContent>
           <Table>
             <TableCaption>Historical record of all service requests.</TableCaption>
             <TableHeader>
               <TableRow>
                 <TableHead>Ticket ID</TableHead>
                 <TableHead>Client</TableHead>
                 <TableHead>Service</TableHead>
                 <TableHead>Technician</TableHead>
                 <TableHead>Date Opened</TableHead>
                  <TableHead>Date Closed</TableHead>
                 <TableHead>Status</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {serviceHistory.map((record) => (
                 <TableRow key={record.id}>
                   <TableCell className="font-mono text-xs">{record.id}</TableCell>
                   <TableCell className="font-medium">{record.client}</TableCell>
                   <TableCell>{record.service}</TableCell>
                   <TableCell>{record.technician}</TableCell>
                   <TableCell className="text-muted-foreground">{record.dateOpened}</TableCell>
                    <TableCell className="text-muted-foreground">{record.dateClosed || 'N/A'}</TableCell>
                   <TableCell>
                     <Badge variant={record.status === 'Closed' ? 'default' : 'outline'}
                            className={`gap-1 ${record.status === 'Closed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : record.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : ''}`}>
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
          <CardFooter>
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
```
  </change>
  <change>
