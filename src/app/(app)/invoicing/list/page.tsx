
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, Search, MoreHorizontal, Eye, Edit, DollarSign, Send, Trash2 } from "lucide-react";
import { InvoiceStatusBadge } from '@/components/invoicing/invoice-status-badge';
import { useAuth } from '@/contexts/auth-context'; // To get language for titles
import { getPageTitleInfo } from '@/lib/translations'; // To get translated titles
import { usePathname } from 'next/navigation'; // To get current path for titles

// Mock data for invoices
const mockInvoices = [
  { id: 'INV-2024-001', clientName: 'Alpha Corp', issueDate: '2024-05-01', dueDate: '2024-05-31', totalAmount: 1250.75, status: 'Pagada' },
  { id: 'INV-2024-002', clientName: 'Beta Industries', issueDate: '2024-05-10', dueDate: '2024-06-10', totalAmount: 875.00, status: 'Enviada' },
  { id: 'INV-2024-003', clientName: 'Gamma Solutions', issueDate: '2024-05-15', dueDate: '2024-06-15', totalAmount: 2300.50, status: 'Borrador' },
  { id: 'INV-2024-004', clientName: 'Delta Services', issueDate: '2024-04-20', dueDate: '2024-05-20', totalAmount: 550.00, status: 'Vencida' },
  { id: 'INV-2024-005', clientName: 'Epsilon LLC', issueDate: '2024-05-20', dueDate: '2024-06-20', totalAmount: 150.25, status: 'Cancelada' },
];

export default function InvoiceListPage() {
  const { languagePreference } = useAuth();
  const pathname = usePathname();
  const currentPageInfo = getPageTitleInfo(languagePreference, pathname);

  // TODO: Replace with actual data fetching and state management
  const [invoices, setInvoices] = useState(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter(invoice =>
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          {/* Page title and subtitle are now handled by AppLayout using currentPageInfo */}
        </div>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar facturas..."
              className="pl-8 sm:w-[200px] md:w-[300px] bg-background border-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button asChild size="sm" className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/invoicing/create">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Crear Factura</span>
            </Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-border bg-card text-card-foreground">
        <CardHeader className="border-b border-border">
          <CardTitle>Lista de Facturas</CardTitle>
          <CardDescription>Visualiza y gestiona todas tus facturas.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>Se encontraron {filteredInvoices.length} facturas.</TableCaption>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground"># Factura</TableHead>
                  <TableHead className="text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-muted-foreground">Fecha Emisión</TableHead>
                  <TableHead className="text-muted-foreground">Fecha Vencimiento</TableHead>
                  <TableHead className="text-right text-muted-foreground">Total</TableHead>
                  <TableHead className="text-center text-muted-foreground">Estado</TableHead>
                  <TableHead className="text-right text-muted-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-muted/50 border-border">
                      <TableCell className="font-mono text-xs text-muted-foreground">{invoice.id}</TableCell>
                      <TableCell className="font-medium text-foreground">{invoice.clientName}</TableCell>
                      <TableCell className="text-muted-foreground">{invoice.issueDate}</TableCell>
                      <TableCell className="text-muted-foreground">{invoice.dueDate}</TableCell>
                      <TableCell className="text-right text-foreground">${invoice.totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <InvoiceStatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Menú de acciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => alert(`Ver factura ${invoice.id}`)} className="cursor-pointer hover:!bg-accent hover:!text-accent-foreground">
                              <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                            </DropdownMenuItem>
                            {invoice.status === 'Borrador' && (
                              <DropdownMenuItem onSelect={() => alert(`Editar factura ${invoice.id}`)} className="cursor-pointer hover:!bg-accent hover:!text-accent-foreground">
                                <Edit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                            )}
                            {invoice.status === 'Borrador' && (
                              <DropdownMenuItem onSelect={() => alert(`Enviar factura ${invoice.id}`)} className="cursor-pointer hover:!bg-accent hover:!text-accent-foreground">
                                <Send className="mr-2 h-4 w-4" /> Marcar como Enviada
                              </DropdownMenuItem>
                            )}
                             {(invoice.status === 'Enviada' || invoice.status === 'Vencida') && (
                              <DropdownMenuItem onSelect={() => alert(`Marcar como pagada ${invoice.id}`)} className="cursor-pointer hover:!bg-accent hover:!text-accent-foreground">
                                <DollarSign className="mr-2 h-4 w-4" /> Marcar como Pagada
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-border" />
                             {invoice.status !== 'Cancelada' && invoice.status !== 'Pagada' && (
                              <DropdownMenuItem onSelect={() => alert(`Cancelar factura ${invoice.id}`)} className="text-destructive focus:text-destructive cursor-pointer hover:!bg-destructive/10 hover:!text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Cancelar Factura
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No se encontraron facturas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
