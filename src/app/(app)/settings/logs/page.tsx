
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ListFilter, FileText, User, Clock, AlertTriangle, FileDown, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from '@/components/ui/date-picker';
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

interface SystemLogEntry {
  id: string;
  timestamp: Timestamp;
  userEmail?: string; // Or userId, depending on how you store it
  action: string;
  level: 'Info' | 'Warning' | 'Error' | 'Debug';
  details?: string;
}

const LOG_LEVELS: SystemLogEntry['level'][] = ['Info', 'Warning', 'Error', 'Debug'];

export default function SystemLogsPage() {
  const [allLogs, setAllLogs] = useState<SystemLogEntry[]>([]);
  const [displayedLogs, setDisplayedLogs] = useState<SystemLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<SystemLogEntry['level'] | 'all'>('all');
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>();
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>();

  // Fetch logs from Firestore
  useEffect(() => {
    setIsLoading(true);
    const logsCollectionRef = collection(db, 'systemLogs');
    const q = query(logsCollectionRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as SystemLogEntry));
      setAllLogs(logsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching system logs:", error);
      toast({ title: "Error", description: "Could not fetch system logs.", variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  // Apply filters client-side
  useEffect(() => {
    let filtered = [...allLogs];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(lowerSearchTerm) ||
        (log.userEmail && log.userEmail.toLowerCase().includes(lowerSearchTerm)) ||
        (log.details && log.details.toLowerCase().includes(lowerSearchTerm)) ||
        log.id.toLowerCase().includes(lowerSearchTerm)
      );
    }
    if (filterLevel !== 'all') {
      filtered = filtered.filter(log => log.level === filterLevel);
    }
    if (filterUser) {
      filtered = filtered.filter(log => log.userEmail && log.userEmail.toLowerCase().includes(filterUser.toLowerCase()));
    }
    if (filterAction) {
      filtered = filtered.filter(log => log.action.toLowerCase().includes(filterAction.toLowerCase()));
    }
    if (filterStartDate) {
      filtered = filtered.filter(log => log.timestamp.toDate() >= filterStartDate);
    }
    if (filterEndDate) {
      const endOfDay = new Date(filterEndDate);
      endOfDay.setHours(23, 59, 59, 999); // Include the whole end day
      filtered = filtered.filter(log => log.timestamp.toDate() <= endOfDay);
    }

    setDisplayedLogs(filtered);
  }, [allLogs, searchTerm, filterLevel, filterUser, filterAction, filterStartDate, filterEndDate]);

  const handleExport = (format: 'csv' | 'pdf') => {
    if (displayedLogs.length === 0) {
      toast({ title: "No Data", description: "No logs to export.", variant: "default" });
      return;
    }
    const dataToExport = displayedLogs.map(log => ({
      ID: log.id,
      Timestamp: format(log.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss'),
      User: log.userEmail || 'System',
      Action: log.action,
      Level: log.level,
      Details: log.details || '',
    }));

    const filename = `system_logs_${format(new Date(), 'yyyyMMddHHmmss')}`;

    if (format === 'csv') {
      exportToCSV(dataToExport, filename);
    } else {
      const columns = [
        { header: 'ID', dataKey: 'ID' },
        { header: 'Timestamp', dataKey: 'Timestamp' },
        { header: 'User', dataKey: 'User' },
        { header: 'Action', dataKey: 'Action' },
        { header: 'Level', dataKey: 'Level' },
        { header: 'Details', dataKey: 'Details' },
      ];
      exportToPDF({ data: dataToExport, columns, title: 'System Logs', filename });
    }
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterLevel('all');
    setFilterUser('');
    setFilterAction('');
    setFilterStartDate(undefined);
    setFilterEndDate(undefined);
    toast({ title: "Filters Cleared", description: "Log filters have been reset." });
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">
          System Logs
        </h1>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search logs (ID, user, action, details...)"
              className="pl-8 sm:w-[200px] lg:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-9 gap-1">
                <FileDown className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Logs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div>
            <Label htmlFor="user-log-filter" className="text-sm font-medium mb-1 block">User Email</Label>
            <Input id="user-log-filter" placeholder="e.g., admin@example.com" value={filterUser} onChange={e => setFilterUser(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="action-log-filter" className="text-sm font-medium mb-1 block">Action</Label>
            <Input id="action-log-filter" placeholder="e.g., Login, Update Asset" value={filterAction} onChange={e => setFilterAction(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="level-log-filter" className="text-sm font-medium mb-1 block">Log Level</Label>
            <Select value={filterLevel} onValueChange={(value) => setFilterLevel(value as SystemLogEntry['level'] | 'all')}>
              <SelectTrigger id="level-log-filter">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {LOG_LEVELS.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
             <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
             <DatePicker id="startDate" value={filterStartDate} onSelect={setFilterStartDate} />
           </div>
           <div className="space-y-2">
             <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
             <DatePicker id="endDate" value={filterEndDate} onSelect={setFilterEndDate} />
           </div>
           <div className="flex items-end col-span-full sm:col-span-1 xl:col-span-1 justify-end pt-4">
             <Button variant="outline" onClick={handleClearFilters} className="w-full sm:w-auto">Clear Filters</Button>
           </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Track system activities and user actions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading system logs...</p>
            </div>
          ) : displayedLogs.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">
                No logs found matching your criteria.
              </div>
          ) : (
            <Table>
              <TableCaption>Detailed log of system and user activities. {displayedLogs.length} of {allLogs.length} record(s) shown.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead><Clock className="h-4 w-4 inline-block mr-1" /> Timestamp</TableHead>
                  <TableHead><User className="h-4 w-4 inline-block mr-1" /> User</TableHead>
                  <TableHead><FileText className="h-4 w-4 inline-block mr-1" /> Action</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(log.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell className="font-medium">{log.userEmail || 'System'}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                      <Badge
                        variant={log.level === 'Error' ? 'destructive' : log.level === 'Warning' ? 'secondary' : 'outline'}
                        className={
                            log.level === 'Error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            log.level === 'Warning' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                            log.level === 'Info' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            'text-muted-foreground'
                        }>
                        {log.level === 'Warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {/* Could add specific icons for Error/Info/Debug if desired */}
                        {log.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]" title={log.details}>
                        {log.details || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>{displayedLogs.length}</strong> of <strong>{allLogs.length}</strong> log entries.
            {/* Add Pagination component here if needed for large datasets */}
          </div>
        </CardFooter>
      </Card>

      <p className="text-sm text-muted-foreground">
        Provides detailed tracking of system activities. Requires appropriate permissions to view.
      </p>
    </div>
  );
}
