
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, User, Clock, AlertTriangle, FileDown, Loader2, Filter } from "lucide-react";
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
import { Label } from '@/components/ui/label';
// Removed Link, usePathname, Tabs, TabsList, TabsTrigger


interface SystemLogEntry {
  id: string;
  timestamp: Timestamp;
  userEmail?: string; 
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

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<SystemLogEntry['level'] | 'all'>('all');
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>();
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>();

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
      endOfDay.setHours(23, 59, 59, 999); 
      filtered = filtered.filter(log => log.timestamp.toDate() <= endOfDay);
    }

    setDisplayedLogs(filtered);
  }, [allLogs, searchTerm, filterLevel, filterUser, filterAction, filterStartDate, filterEndDate]);

  const handleExport = (formatType: 'csv' | 'pdf') => {
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

    const filenameBase = `system_logs_${format(new Date(), 'yyyyMMddHHmmss')}`;

    if (formatType === 'csv') {
      exportToCSV(dataToExport, filenameBase);
    } else {
      const columns = [
        { header: 'ID', dataKey: 'ID' },
        { header: 'Timestamp', dataKey: 'Timestamp' },
        { header: 'User', dataKey: 'User' },
        { header: 'Action', dataKey: 'Action' },
        { header: 'Level', dataKey: 'Level' },
        { header: 'Details', dataKey: 'Details' },
      ];
      exportToPDF({ data: dataToExport, columns, title: 'System Logs', filename: `${filenameBase}.pdf` });
    }
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterLevel('all');
    setFilterUser('');
    setFilterAction('');
    setFilterStartDate(undefined);
    setFilterEndDate(undefined);
    toast({ title: "Filtros Limpiados", description: "Los filtros de logs han sido reiniciados." });
  };


  return (
    <div className="space-y-6">
      {/* Removed Tabs navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         {/* Title handled by AppLayout */}
         <div className="flex-1"></div> {/* Spacer */}
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar logs (ID, usuario, acción, detalles...)"
              className="pl-8 sm:w-[200px] lg:w-[300px] bg-background border-input text-foreground placeholder:text-muted-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-9 gap-1 text-muted-foreground hover:text-foreground border-input hover:bg-accent">
                <FileDown className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Exportar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
              <DropdownMenuItem onClick={() => handleExport('csv')} className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">Exportar como CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')} className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">Exportar como PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground"><Filter className="h-5 w-5 text-primary"/> Filtrar Logs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div>
            <Label htmlFor="user-log-filter" className="text-sm font-medium mb-1 block text-muted-foreground">Email de Usuario</Label>
            <Input id="user-log-filter" placeholder="ej., admin@example.com" value={filterUser} onChange={e => setFilterUser(e.target.value)} className="bg-background border-input text-foreground placeholder:text-muted-foreground"/>
          </div>
          <div>
            <Label htmlFor="action-log-filter" className="text-sm font-medium mb-1 block text-muted-foreground">Acción</Label>
            <Input id="action-log-filter" placeholder="ej., Login, Update Asset" value={filterAction} onChange={e => setFilterAction(e.target.value)} className="bg-background border-input text-foreground placeholder:text-muted-foreground"/>
          </div>
          <div>
            <Label htmlFor="level-log-filter" className="text-sm font-medium mb-1 block text-muted-foreground">Nivel de Log</Label>
            <Select value={filterLevel} onValueChange={(value) => setFilterLevel(value as SystemLogEntry['level'] | 'all')}>
              <SelectTrigger id="level-log-filter" className="bg-background border-input text-foreground">
                <SelectValue placeholder="Todos los Niveles" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                <SelectItem value="all">Todos los Niveles</SelectItem>
                {LOG_LEVELS.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
             <Label htmlFor="startDate" className="text-sm font-medium text-muted-foreground">Fecha Inicio</Label>
             <DatePicker id="startDate" value={filterStartDate} onSelect={setFilterStartDate} />
           </div>
           <div className="space-y-2">
             <Label htmlFor="endDate" className="text-sm font-medium text-muted-foreground">Fecha Fin</Label>
             <DatePicker id="endDate" value={filterEndDate} onSelect={setFilterEndDate} />
           </div>
           <div className="flex items-end col-span-full sm:col-span-1 xl:col-span-1 justify-end pt-4">
             <Button variant="outline" onClick={handleClearFilters} className="w-full sm:w-auto border-input hover:bg-accent hover:text-accent-foreground">Limpiar Filtros</Button>
           </div>
        </CardContent>
      </Card>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Registro de Actividad</CardTitle>
          <CardDescription className="text-muted-foreground">Rastrear actividades del sistema y acciones del usuario.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Cargando logs del sistema...</p>
            </div>
          ) : displayedLogs.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">
                No se encontraron logs que coincidan con tus criterios.
              </div>
          ) : (
            <div className="overflow-x-auto">
                <Table>
                <TableCaption className="text-muted-foreground">Log detallado de actividades del sistema y de usuarios. {displayedLogs.length} de {allLogs.length} registro(s) mostrados.</TableCaption>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground"><Clock className="h-4 w-4 inline-block mr-1" /> Timestamp</TableHead>
                  <TableHead className="text-muted-foreground"><User className="h-4 w-4 inline-block mr-1" /> Usuario</TableHead>
                  <TableHead className="text-muted-foreground"><FileText className="h-4 w-4 inline-block mr-1" /> Acción</TableHead>
                  <TableHead className="text-muted-foreground">Nivel</TableHead>
                  <TableHead className="text-muted-foreground">Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedLogs.map((log) => (
                  <TableRow key={log.id} className="border-border hover:bg-muted/50">
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(log.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{log.userEmail || 'Sistema'}</TableCell>
                    <TableCell className="text-foreground">{log.action}</TableCell>
                    <TableCell>
                      <Badge
                        variant={log.level === 'Error' ? 'destructive' : log.level === 'Warning' ? 'secondary' : 'outline'}
                        className={
                            log.level === 'Error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700' :
                            log.level === 'Warning' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-300 dark:border-orange-700' :
                            log.level === 'Info' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700' :
                            'text-muted-foreground border-border'
                        }>
                        {log.level === 'Warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
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
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t border-border pt-4">
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>{displayedLogs.length}</strong> de <strong>{allLogs.length}</strong> entradas de log.
          </div>
        </CardFooter>
      </Card>

      <p className="text-sm text-muted-foreground">
        Proporciona un seguimiento detallado de las actividades del sistema. Requiere permisos apropiados para ver.
      </p>
    </div>
  );
}
