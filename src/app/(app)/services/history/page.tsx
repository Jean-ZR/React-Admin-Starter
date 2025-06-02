
'use client'; 

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ListFilter, FileDown, CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase/config';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { format } from 'date-fns';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface ServiceLogEntry {
  id: string;
  clientName?: string;
  serviceName?: string;
  technicianName?: string;
  scheduledDate: Timestamp;
  scheduledTime: string;
  status: string;
  notes?: string;
  createdAt: Timestamp;
}

const ALL_STATUSES = ["Scheduled", "Confirmed", "In Progress", "Completed", "Cancelled"];

export default function ServiceHistoryPage() {
  const [allServiceLogs, setAllServiceLogs] = useState<ServiceLogEntry[]>([]);
  const [displayedServiceLogs, setDisplayedServiceLogs] = useState<ServiceLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  const fetchServiceLogs = useCallback(() => {
    setIsLoading(true);
    const logsCollectionRef = collection(db, 'serviceAppointments');
    const q = query(logsCollectionRef, orderBy('scheduledDate', 'desc'), orderBy('scheduledTime', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data() as DocumentData;
        return {
          id: docSnapshot.id,
          clientName: data.clientName,
          serviceName: data.serviceName,
          technicianName: data.technicianName,
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          status: data.status,
          notes: data.notes,
          createdAt: data.createdAt,
        } as ServiceLogEntry;
      });
      setAllServiceLogs(logsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching service logs:", error);
      toast({ title: "Error", description: "Could not fetch service history.", variant: "destructive" });
      setIsLoading(false);
    });

    return unsubscribe;
  }, [toast]);

  useEffect(() => {
    const unsubscribe = fetchServiceLogs();
    return () => unsubscribe();
  }, [fetchServiceLogs]);

  useEffect(() => {
    let filtered = [...allServiceLogs];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.id.toLowerCase().includes(lowerSearchTerm) ||
        (log.clientName && log.clientName.toLowerCase().includes(lowerSearchTerm)) ||
        (log.serviceName && log.serviceName.toLowerCase().includes(lowerSearchTerm)) ||
        (log.technicianName && log.technicianName.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (statusFilters.length > 0) {
      filtered = filtered.filter(log => statusFilters.includes(log.status));
    }

    setDisplayedServiceLogs(filtered);
  }, [allServiceLogs, searchTerm, statusFilters]);

  const handleExport = (formatType: 'csv' | 'pdf') => {
    if (displayedServiceLogs.length === 0) {
      toast({ title: "No Data", description: "No service history records to export.", variant: "default" });
      return;
    }
    const dataToExport = displayedServiceLogs.map(log => ({
      'Ticket ID': log.id,
      'Client': log.clientName || 'N/A',
      'Service': log.serviceName || 'N/A',
      'Technician': log.technicianName || 'N/A',
      'Scheduled Date': log.scheduledDate ? format(log.scheduledDate.toDate(), 'yyyy-MM-dd') : 'N/A',
      'Time': log.scheduledTime,
      'Status': log.status,
      'Created At': log.createdAt ? format(log.createdAt.toDate(), 'yyyy-MM-dd HH:mm') : 'N/A',
      'Notes': log.notes || '',
    }));

    const filenameBase = `service_history_${format(new Date(), 'yyyyMMddHHmmss')}`;

    if (formatType === 'csv') {
      exportToCSV(dataToExport, filenameBase);
    } else {
      const columns = [
        { header: 'Ticket ID', dataKey: 'Ticket ID' },
        { header: 'Client', dataKey: 'Client' },
        { header: 'Service', dataKey: 'Service' },
        { header: 'Technician', dataKey: 'Technician' },
        { header: 'Scheduled Date', dataKey: 'Scheduled Date' },
        { header: 'Time', dataKey: 'Time' },
        { header: 'Status', dataKey: 'Status' },
        { header: 'Created At', dataKey: 'Created At' },
      ];
      exportToPDF({ data: dataToExport, columns, title: 'Service History', filename: `${filenameBase}.pdf` });
    }
  };
  
  const handleStatusFilterChange = (status: string) => {
    setStatusFilters(prevFilters =>
        prevFilters.includes(status)
            ? prevFilters.filter(s => s !== status)
            : [...prevFilters, status]
    );
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         <div className="flex-1"></div> {/* Spacer */}
          <div className="flex gap-2 items-center w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search ID, client, service..."
              className="pl-8 sm:w-[300px] bg-background border-input text-foreground placeholder:text-muted-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1 text-muted-foreground hover:text-foreground border-input hover:bg-accent">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Filter Status</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border"/>
              {ALL_STATUSES.map(status => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilters.includes(status)}
                  onCheckedChange={() => handleStatusFilterChange(status)}
                  className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground"
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-9 gap-1 text-muted-foreground hover:text-foreground border-input hover:bg-accent">
                <FileDown className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
              <DropdownMenuItem onClick={() => handleExport('csv')} className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')} className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
       </div>

       <Card className="bg-card text-card-foreground border-border">
         <CardHeader>
           <CardTitle className="text-foreground">Service Record Log</CardTitle>
           <CardDescription className="text-muted-foreground">Track service delivery and maintenance records.</CardDescription>
         </CardHeader>
         <CardContent>
           {isLoading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">Loading service history...</p>
              </div>
           ) : displayedServiceLogs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
                No service records found matching your criteria.
            </div>
           ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption className="text-muted-foreground">Historical record of all service appointments.</TableCaption>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Ticket ID</TableHead>
                    <TableHead className="text-muted-foreground">Client</TableHead>
                    <TableHead className="text-muted-foreground">Service</TableHead>
                    <TableHead className="text-muted-foreground">Technician</TableHead>
                    <TableHead className="text-muted-foreground">Scheduled</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedServiceLogs.map((record) => (
                    <TableRow key={record.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-mono text-xs text-muted-foreground">{record.id}</TableCell>
                      <TableCell className="font-medium text-foreground">{record.clientName || 'N/A'}</TableCell>
                      <TableCell className="text-foreground">{record.serviceName || 'N/A'}</TableCell>
                      <TableCell className="text-foreground">{record.technicianName || 'N/A'}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {record.scheduledDate ? format(record.scheduledDate.toDate(), 'yyyy-MM-dd') : 'N/A'}
                        {' @ '}{record.scheduledTime}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={record.status === 'Completed' ? 'default' : record.status === 'Cancelled' ? 'destructive' : 'outline'}
                          className={`gap-1 ${
                              record.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700' : 
                              record.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700' : 
                              record.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700' :
                              record.status === 'Confirmed' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300 dark:border-purple-700' :
                              record.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700' :
                              'text-muted-foreground border-border'
                          }`}>
                          {record.status === 'Completed' && <CheckCircle className="h-3 w-3" />}
                          {record.status === 'In Progress' && <Clock className="h-3 w-3" />}
                          {record.status !== 'Completed' && record.status !== 'In Progress' && <AlertCircle className="h-3 w-3" />}
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
           )}
         </CardContent>
          <CardFooter className="border-t border-border pt-4">
            <div className="text-xs text-muted-foreground">
              Showing <strong>{displayedServiceLogs.length}</strong> of <strong>{allServiceLogs.length}</strong> records.
            </div>
         </CardFooter>
       </Card>

       <p className="text-sm text-muted-foreground">
         Track service delivery and maintenance records with search and filtering. Audit logs and role-based access are applied.
       </p>
     </div>
  );
}
