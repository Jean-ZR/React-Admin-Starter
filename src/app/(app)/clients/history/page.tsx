
'use client'; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, MessageSquare, FileText, DollarSign, FileDown } from "lucide-react"; 
// Removed Link, Tabs, TabsList, TabsTrigger, usePathname

const history = [
  { id: 'HIST001', date: '2024-07-15', type: 'Service Request', description: 'Opened ticket #SRV1023 - Network issue', client: 'Alpha Corp', status: 'Closed' },
  { id: 'HIST002', date: '2024-07-10', type: 'Communication', description: 'Email sent regarding invoice #INV500', client: 'Beta Industries', status: 'Sent' },
  { id: 'HIST003', date: '2024-07-05', type: 'Transaction', description: 'Payment received for invoice #INV490', client: 'Alpha Corp', status: 'Completed' },
  { id: 'HIST004', date: '2024-06-28', type: 'Service Request', description: 'Opened ticket #SRV1020 - Software install', client: 'Gamma Solutions', status: 'In Progress' },
  { id: 'HIST005', date: '2024-06-20', type: 'Communication', description: 'Phone call follow-up on project proposal', client: 'Beta Industries', status: 'Logged' },
];

export default function ClientHistoryPage() {
  // Removed usePathname

    const handleExport = () => {
        console.log("Exporting client history..."); 
        alert("Export functionality not yet implemented.");
    };

     const handleApplyFilters = () => {
        console.log("Applying filters...");
        alert("Filter functionality not yet implemented.");
    };

  return (
    <div className="space-y-6">
      {/* Removed Tabs navigation */}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
          Historial del Cliente
        </h1>
        <div className="flex gap-2 items-center w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar historial..."
              className="pl-8 sm:w-[300px] bg-background border-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button size="sm" variant="outline" className="h-9 gap-1 text-muted-foreground hover:text-foreground border-input hover:bg-accent" onClick={handleExport}>
             <FileDown className="h-3.5 w-3.5" />
             <span className="sr-only sm:not-sr-only">Exportar</span>
          </Button>
        </div>
      </div>

       <Card className="bg-card text-card-foreground border-border">
         <CardHeader>
            <CardTitle className="text-foreground">Filtrar Historial</CardTitle>
         </CardHeader>
         <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <div>
              <label htmlFor="client-filter" className="text-sm font-medium mb-1 block text-muted-foreground">Cliente</label>
              <Select>
                <SelectTrigger id="client-filter" className="bg-background border-input text-foreground">
                  <SelectValue placeholder="Todos los Clientes" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border">
                   <SelectItem value="all">Todos los Clientes</SelectItem>
                   <SelectItem value="CLI001">Alpha Corp</SelectItem>
                   <SelectItem value="CLI002">Beta Industries</SelectItem>
                   <SelectItem value="CLI003">Gamma Solutions</SelectItem>
                   <SelectItem value="CLI004">Delta Services</SelectItem>
                </SelectContent>
              </Select>
           </div>
            <div>
              <label htmlFor="type-filter" className="text-sm font-medium mb-1 block text-muted-foreground">Tipo</label>
              <Select>
                <SelectTrigger id="type-filter" className="bg-background border-input text-foreground">
                  <SelectValue placeholder="Todos los Tipos" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border">
                   <SelectItem value="all">Todos los Tipos</SelectItem>
                   <SelectItem value="service">Solicitud de Servicio</SelectItem>
                   <SelectItem value="comm">Comunicación</SelectItem>
                   <SelectItem value="trans">Transacción</SelectItem>
                </SelectContent>
              </Select>
           </div>
           <div className="flex items-end col-start-auto md:col-start-4">
             <Button className="w-full lg:w-auto bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleApplyFilters}>Aplicar Filtros</Button>
           </div>
         </CardContent>
       </Card>

      <Card className="bg-card text-card-foreground border-border">
         <CardHeader>
          <CardTitle className="text-foreground">Registro de Interacciones</CardTitle>
           <CardDescription className="text-muted-foreground">Seguimiento de transacciones y comunicaciones relacionadas con el cliente.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Fecha</TableHead>
                <TableHead className="text-muted-foreground">Cliente</TableHead>
                <TableHead className="text-muted-foreground">Tipo</TableHead>
                <TableHead className="text-muted-foreground">Descripción</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id} className="border-border hover:bg-muted/50">
                  <TableCell className="text-muted-foreground">{item.date}</TableCell>
                  <TableCell className="font-medium text-foreground">{item.client}</TableCell>
                  <TableCell>
                     <Badge variant="secondary" className="gap-1 items-center bg-secondary text-secondary-foreground">
                        {item.type === 'Service Request' && <MessageSquare className="h-3 w-3"/>}
                        {item.type === 'Communication' && <FileText className="h-3 w-3"/>}
                         {item.type === 'Transaction' && <DollarSign className="h-3 w-3"/>}
                         {item.type}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-foreground">{item.description}</TableCell>
                  <TableCell>
                     <Badge variant={item.status === 'Closed' || item.status === 'Completed' ? 'default' : 'outline'}
                            className={item.status === 'Closed' || item.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700' : 'text-muted-foreground border-border'}>
                       {item.status}
                     </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      <p className="text-sm text-muted-foreground">
        Realiza un seguimiento de las transacciones y comunicaciones relacionadas con el cliente con búsqueda y filtrado. Se aplican registros de auditoría y acceso basado en roles.
      </p>
    </div>
  );
}
