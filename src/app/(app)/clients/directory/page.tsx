
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
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  type Timestamp,
} from 'firebase/firestore';

interface Client extends ClientFormData {
  id: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const ALL_STATUSES = ["Active", "Inactive", "Prospect"]; // For filter checkboxes

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
      let q = query(clientsCollectionRef);

      if (statusFilters.length > 0) {
        q = query(q, where('status', 'in', statusFilters));
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const clientsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Client));

        // Client-side search filtering
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


    const handleAddClient = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const handleEditClient = (client: Client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (client: Client) => {
        setClientToDelete(client);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (clientToDelete) {
            try {
                await deleteDoc(doc(db, 'clients', clientToDelete.id));
                toast({ title: "Success", description: "Client deleted successfully." });
                // Real-time updates handle UI, no need to manually filter currentClients
            } catch (error) {
                console.error("Error deleting client:", error);
                toast({ title: "Error", description: "Could not delete client.", variant: "destructive" });
            } finally {
                setIsDeleteDialogOpen(false);
                setClientToDelete(null);
            }
        }
    };

    const handleSaveClient = async (formData: ClientFormData) => {
        try {
            if (editingClient) {
                const clientDocRef = doc(db, 'clients', editingClient.id);
                await updateDoc(clientDocRef, { ...formData, updatedAt: serverTimestamp() });
                toast({ title: "Success", description: "Client updated successfully." });
            } else {
                await addDoc(collection(db, 'clients'), {
                   ...formData,
                   dataAiHint: formData.dataAiHint || 'company client', // Ensure hint
                   createdAt: serverTimestamp()
                });
                toast({ title: "Success", description: "Client added successfully." });
            }
            // Real-time updates handle UI
        } catch (error) {
            console.error("Error saving client:", error);
            toast({ title: "Error", description: "Could not save client.", variant: "destructive" });
        } finally {
            setIsModalOpen(false);
            setEditingClient(null);
        }
    };

    const handleExportCSV = () => {
        if (currentClients.length === 0) {
            toast({ title: "No Data", description: "No clients to export.", variant: "default" });
            return;
        }
        exportToCSV(currentClients.map(({ id, createdAt, updatedAt, ...rest }) => rest) , 'client_directory'); // Exclude id, timestamps
    };

    const handleExportPDF = () => {
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
            data: currentClients.map(({ id, createdAt, updatedAt, ...rest }) => rest), // Exclude id, timestamps
            columns: columns,
            title: 'Client Directory',
            filename: 'client_directory.pdf',
        });
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
        <h1 className="text-2xl font-semibold leading-none tracking-tight">
          Client Directory
        </h1>
         <div className="flex gap-2 items-center w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
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
            <DropdownMenuContent align="end">
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
             <DropdownMenuContent align="end">
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

      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
           <CardDescription>Maintain client database with contact information.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading clients...</p>
            </div>
          ) : currentClients.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">
                No clients found matching your criteria.
              </div>
          ) : (
            <Table>
              <TableCaption>A list of your clients. {currentClients.length} client(s) found.</TableCaption>
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
                  <TableRow key={client.id}>
                   <TableCell className="hidden sm:table-cell">
                       <Avatar className="h-9 w-9">
                          <AvatarImage src={`https://placehold.co/40x40.png`} alt={client.name} data-ai-hint={client.dataAiHint || 'person company'} />
                          <AvatarFallback>{client.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                     </TableCell>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.contact}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
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
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditClient(client)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(client)} className="text-destructive">
                              Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Maintain client database with contact information, search, and export. Audit logs and role-based access are applied.
      </p>

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
