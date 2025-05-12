'use client'; // Required for state and handlers

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, ListFilter, MoreHorizontal, PlusCircle, FileDown } from "lucide-react"; // Added icons
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { ClientFormModal } from '@/components/clients/client-form-modal'; // Import modal
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'; // Import delete dialog
import { exportToCSV, exportToPDF } from '@/lib/export'; // Import export functions

const clients = [
  { id: 'CLI001', name: 'Alpha Corp', contact: 'Alice Johnson', email: 'alice@alpha.com', phone: '555-1234', status: 'Active', address: '123 Main St', dataAiHint: 'building office' },
  { id: 'CLI002', name: 'Beta Industries', contact: 'Bob Williams', email: 'bob@beta.com', phone: '555-5678', status: 'Active', address: '456 Oak Ave', dataAiHint: 'factory industrial' },
  { id: 'CLI003', name: 'Gamma Solutions', contact: 'Charlie Brown', email: 'charlie@gamma.com', phone: '555-9012', status: 'Inactive', address: '789 Pine Rd', dataAiHint: 'code computer' },
  { id: 'CLI004', name: 'Delta Services', contact: 'Diana Davis', email: 'diana@delta.com', phone: '555-3456', status: 'Active', address: '101 Maple Dr', dataAiHint: 'support callcenter' },
];

type Client = typeof clients[0]; // Define Client type

export default function ClientDirectoryPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

    // TODO: Replace with actual data fetching and state management (e.g., React Query, Zustand)
    const [currentClients, setCurrentClients] = useState(clients);

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

    const confirmDelete = () => {
        if (clientToDelete) {
            console.log("Deleting client:", clientToDelete.id); // Replace with actual delete logic
            // TODO: Call API to delete client
            // Example: Simulating deletion from local state
             setCurrentClients(currentClients.filter(client => client.id !== clientToDelete.id));
            setIsDeleteDialogOpen(false);
            setClientToDelete(null);
            // Optionally refetch data here
        }
    };

    const handleSaveClient = (formData: any) => {
        if (editingClient) {
            console.log("Updating client:", editingClient.id, formData);
            // TODO: Call API to update client
            // Example: Simulating update in local state
            setCurrentClients(currentClients.map(client =>
                 client.id === editingClient.id ? { ...client, ...formData } : client
            ));
        } else {
            console.log("Adding new client:", formData);
            // TODO: Call API to add client
            // Example: Simulating addition to local state
             const newClient = { ...formData, id: `CLI${String(currentClients.length + 1).padStart(3, '0')}`, dataAiHint: 'office building' }; // Generate ID and hint
             setCurrentClients([...currentClients, newClient]);
        }
        // Optionally refetch data here
        setIsModalOpen(false); // Close modal after save
    };

    const handleExportCSV = () => {
        exportToCSV(currentClients, 'client_directory');
    };

    const handleExportPDF = () => {
        // Define columns for PDF export
        const columns = [
            { header: 'ID', dataKey: 'id' },
            { header: 'Name', dataKey: 'name' },
            { header: 'Contact', dataKey: 'contact' },
            { header: 'Email', dataKey: 'email' },
            { header: 'Phone', dataKey: 'phone' },
            { header: 'Status', dataKey: 'status' },
            { header: 'Address', dataKey: 'address' },
        ];
        exportToPDF({
            data: currentClients,
            columns: columns,
            title: 'Client Directory',
            filename: 'client_directory.pdf',
        });
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
            />
          </div>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Active</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Inactive</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Prospect</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
           {/* Export Dropdown */}
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
          <Table>
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
                        {/* Placeholder - generate initials or use image */}
                        <AvatarImage src={`https://picsum.photos/40/40?random=${client.id}`} alt={client.name} data-ai-hint={client.dataAiHint} />
                        <AvatarFallback>{client.name.substring(0, 1)}</AvatarFallback>
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClient(client)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View History</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(client)}
                        >
                            Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      <p className="text-sm text-muted-foreground">
        Maintain client database with contact information, search, and export. Audit logs and role-based access are applied.
      </p>

       {/* Add/Edit Modal */}
      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveClient}
        clientData={editingClient}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemName={clientToDelete?.name || 'this client'}
      />
    </div>
  );
}
