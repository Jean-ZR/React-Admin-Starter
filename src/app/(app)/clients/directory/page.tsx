
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, ListFilter, MoreHorizontal, PlusCircle, FileDown, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { ClientFormModal, type ClientFormData } from '@/components/clients/client-form-modal';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { exportToCSV, exportToPDF } from '@/lib/export';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase/config';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  type Timestamp,
  orderBy,
} from 'firebase/firestore';

interface Client extends ClientFormData {
  id: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const ALL_STATUSES = ["Active", "Inactive", "Prospect"];

export default function ClientDirectoryPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [currentClients, setCurrentClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilters, setStatusFilters] = useState<string[]>([]);
    const { toast } = useToast();

    const fetchClients = useCallback(() => {
      setIsLoading(true);
      const clientsCollectionRef = collection(db, 'clients');
      let qConstraints = [orderBy('name', 'asc')]; // Base query with ordering

      if (statusFilters.length > 0) {
        qConstraints.push(where('status', 'in', statusFilters));
      }
      
      const q = query(clientsCollectionRef, ...qConstraints);


      const unsubscribe = onSnapshot(q, (snapshot) => {
        const clientsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Client));

        const searchedClients = clientsData.filter(client =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.contact && client.contact.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        setCurrentClients(searchedClients);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching clients:", error);
        toast({ title: "Error", description: "Could not fetch clients.", variant: "destructive" });
        setIsLoading(false);
      });

      return unsubscribe;
    }, [statusFilters, searchTerm, toast]);

    useEffect(() => {
      const unsubscribe = fetchClients();
      return () => unsubscribe();
    }, [fetchClients]);


    const handleAddClient = useCallback(() => {
        setEditingClient(null);
        setIsModalOpen(true);
    }, []);

    const handleEditClient = useCallback((client: Client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    }, []);

    const handleDeleteClick = useCallback((client: Client) => {
        setClientToDelete(client);
        setIsDeleteDialogOpen(true);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (clientToDelete) {
            try {
                await deleteDoc(doc(db, 'clients', clientToDelete.id));
                toast({ title: "Success", description: "Client deleted successfully." });
            } catch (error) {
                console.error("Error deleting client:", error);
                toast({ title: "Error", description: "Could not delete client.", variant: "destructive" });
            } finally {
                setIsDeleteDialogOpen(false);
                setClientToDelete(null);
            }
        }
    }, [clientToDelete, toast]);

    const handleSaveClient = useCallback(async (formData: ClientFormData) => {
        try {
            const dataToSave = {
                ...formData,
                dataAiHint: formData.dataAiHint || formData.name.toLowerCase().split(' ').slice(0,2).join(' ') || 'company client',
            }
            if (editingClient) {
                const clientDocRef = doc(db, 'clients', editingClient.id);
                await updateDoc(clientDocRef, { ...dataToSave, updatedAt: serverTimestamp() });
                toast({ title: "Success", description: "Client updated successfully." });
            } else {
                await addDoc(collection(db, 'clients'), {
                   ...dataToSave,
                   createdAt: serverTimestamp(),
                   updatedAt: serverTimestamp()
                });
                toast({ title: "Success", description: "Client added successfully." });
            }
        } catch (error) {
            console.error("Error saving client:", error);
            toast({ title: "Error", description: "Could not save client.", variant: "destructive" });
        } finally {
            setIsModalOpen(false);
            setEditingClient(null);
        }
    }, [editingClient, toast]);

    const handleExportCSV = useCallback(() => {
        if (currentClients.length === 0) {
            toast({ title: "No Data", description: "No clients to export.", variant: "default" });
            return;
        }
        exportToCSV(currentClients.map(({ id, createdAt, updatedAt, ...rest }) => rest) , 'client_directory');
    }, [currentClients, toast]);

    const handleExportPDF = useCallback(() => {
      if (currentClients.length === 0) {
            toast({ title: "No Data", description: "No clients to export.", variant: "default" });
            return;
        }
        const columns = [
            { header: 'Name', dataKey: 'name' },
            { header: 'Contact', dataKey: 'contact' },
            { header: 'Email', dataKey: 'email' },
            { header: 'Phone', dataKey: 'phone' },
            { header: 'Status', dataKey: 'status' },
            { header: 'Address', dataKey: 'address' },
        ];
        exportToPDF({
            data: currentClients.map(({ id, createdAt, updatedAt, ...rest }) => rest),
            columns: columns,
            title: 'Client Directory',
            filename: 'client_directory.pdf',
        });
    }, [currentClients, toast]);

    const handleStatusFilterChange = useCallback((status: string) => {
        setStatusFilters(prevFilters =>
            prevFilters.includes(status)
                ? prevFilters.filter(s => s !== status)
                : [...prevFilters, status]
        );
    }, []);

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="border-b border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Client Directory</CardTitle>
              <CardDescription>Maintain client database with contact information.</CardDescription>
            </div>
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search clients..."
                  className="pl-8 sm:w-[200px] md:w-[200px] lg:w-[250px] bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Filter Status
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ALL_STATUSES.map(status => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilters.includes(status)}
                      onCheckedChange={() => handleStatusFilterChange(status)}
                    >
                      {status}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="h-9 gap-1">
                    <FileDown className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
                  <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF}>Export as PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" className="h-9 gap-1" onClick={handleAddClient}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Add Client</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading clients...</p>
            </div>
          ) : currentClients.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">
                No clients found matching your criteria.
              </div>
          ) : (
            <div className="overflow-x-auto">
                <Table>
                <TableCaption className="py-4">A list of your clients. {currentClients.length} client(s) found.</TableCaption>
                <TableHeader>
                    <TableRow>
                    <TableHead className="hidden w-[64px] sm:table-cell">
                        <span className="sr-only">Avatar</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-muted/50">
                    <TableCell className="hidden sm:table-cell">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={`https://placehold.co/40x40.png`} alt={client.name} data-ai-hint={client.dataAiHint || 'person company'} />
                            <AvatarFallback className="bg-muted text-muted-foreground">{client.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{client.name}</TableCell>
                        <TableCell className="text-muted-foreground">{client.contact}</TableCell>
                        <TableCell className="text-muted-foreground">{client.email}</TableCell>
                        <TableCell className="text-muted-foreground">{client.phone}</TableCell>
                        <TableCell>
                            <Badge variant={client.status === 'Active' ? 'default' : 'outline'}
                            className={client.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'text-muted-foreground'}>
                            {client.status}
                        </Badge>
                        </TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditClient(client)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(client)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                Delete
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveClient}
        clientData={editingClient}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemName={clientToDelete?.name || 'this client'}
      />
    </div>
  );
}
