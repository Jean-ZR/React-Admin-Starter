
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, MoreHorizontal, Loader2, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } // Changed from @/components/ui/label to @/components/ui/form Field specific labels
from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  type Timestamp,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { UserFormModal, type UserFormData, type UserData } from '@/components/settings/user-form-modal';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { format } from 'date-fns';
// Removed Link, usePathname, Tabs, TabsList, TabsTrigger

const AVAILABLE_ROLES = ['Administrator', 'Teacher', 'Student', 'Read Only', 'Manager']; 
const AVAILABLE_STATUSES = ['Active', 'Inactive', 'Pending'];


export default function UserManagementPage() {
  const { user: currentUser, role: currentUserRole } = useAuth();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isInviteMode, setIsInviteMode] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

  const isAdmin = currentUserRole === 'admin';

  const fetchUsers = useCallback(() => {
    if (!isAdmin) {
      setIsLoading(false);
      return () => {}; 
    }
    setIsLoading(true);
    const usersCollectionRef = collection(db, 'users');
    let qConstraints = [orderBy('displayName', 'asc')];

    if (filterRole !== 'all') {
      qConstraints.push(where('role', '==', filterRole));
    }
    if (filterStatus !== 'all') {
      qConstraints.push(where('status', '==', filterStatus));
    }
    
    const q = query(usersCollectionRef, ...qConstraints);


    const unsubscribe = onSnapshot(q, (snapshot) => {
      let usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<UserData, 'id'>),
      }));
      
      setAllUsers(usersData);
      setDisplayedUsers(usersData); 
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      toast({ title: "Error", description: "Could not fetch users.", variant: "destructive" });
      setIsLoading(false);
    });

    return unsubscribe;
  }, [isAdmin, filterRole, filterStatus, toast]);

  useEffect(() => {
    const unsubscribe = fetchUsers();
    return () => unsubscribe();
  }, [fetchUsers]);

   useEffect(() => {
        let filtered = [...allUsers];
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(u =>
                (u.displayName && u.displayName.toLowerCase().includes(lowerSearchTerm)) ||
                (u.email && u.email.toLowerCase().includes(lowerSearchTerm))
            );
        }
        setDisplayedUsers(filtered);
    }, [searchTerm, allUsers]);


  const handleInviteUser = () => {
    if (!isAdmin) return;
    setEditingUser(null);
    setIsInviteMode(true);
    setIsUserFormModalOpen(true);
  };

  const handleEditUser = (user: UserData) => {
    if (!isAdmin) return;
    setEditingUser(user);
    setIsInviteMode(false);
    setIsUserFormModalOpen(true);
  };

  const handleDeleteClick = (user: UserData) => {
    if (!isAdmin) return;
    if (currentUser && user.id === currentUser.uid) {
        toast({ title: "Action Not Allowed", description: "You cannot delete your own account from this panel.", variant: "destructive" });
        return;
    }
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!isAdmin || !userToDelete) return;
    try {
      await deleteDoc(doc(db, 'users', userToDelete.id));
      toast({ title: "Success", description: `User ${userToDelete.displayName || userToDelete.email} removed from Firestore.` });
    } catch (error) {
      console.error("Error deleting user from Firestore:", error);
      toast({ title: "Error", description: "Could not remove user from Firestore.", variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleSaveUser = async (formData: UserFormData) => {
    if (!isAdmin) {
        toast({ title: "Access Denied", description: "You don't have permission to modify users.", variant: "destructive"});
        return;
    }

    if (isInviteMode) {
      console.log("Invite user data (conceptual):", formData);
      toast({ title: "Conceptual Invite", description: `Invitation for ${formData.email} with role ${formData.role} would be processed here.`});
    } else if (editingUser) {
      try {
        const userDocRef = doc(db, 'users', editingUser.id);
        await updateDoc(userDocRef, {
          displayName: formData.displayName,
          role: formData.role,
          status: formData.status,
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Success", description: "User details updated successfully." });
      } catch (error) {
        console.error("Error updating user:", error);
        toast({ title: "Error", description: "Could not update user details.", variant: "destructive" });
        throw error; 
      }
    }
    setIsUserFormModalOpen(false);
    setEditingUser(null);
    setIsInviteMode(false);
  };
  

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setFilterStatus('all');
    toast({ title: "Filters Cleared", description: "Showing all users." });
  };

  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return 'U';
  };
  

  if (!isAdmin && !isLoading) { 
    return (
      <div className="space-y-6">
         {/* Title handled by AppLayout */}
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader><CardTitle className="text-foreground">Acceso Denegado</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">No tienes permiso para administrar usuarios.</p></CardContent>
        </Card>
      </div>
    );
  }


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
              placeholder="Buscar usuarios (nombre, email)..."
              className="pl-8 sm:w-[300px] bg-background border-input text-foreground placeholder:text-muted-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!isAdmin}
            />
          </div>
          <Button size="sm" className="h-9 gap-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleInviteUser} disabled={!isAdmin}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Invitar Usuario</span>
          </Button>
         </div>
      </div>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground"><Filter className="h-5 w-5 text-primary"/> Filtrar Usuarios</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="role-filter" className="text-xs text-muted-foreground">Filtrar por Rol</Label>
              <Select value={filterRole} onValueChange={setFilterRole} disabled={!isAdmin}>
                <SelectTrigger id="role-filter" className="h-9 bg-background border-input text-foreground">
                  <SelectValue placeholder="Todos los Roles" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border">
                   <SelectItem value="all">Todos los Roles</SelectItem>
                   {AVAILABLE_ROLES.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                </SelectContent>
              </Select>
           </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="status-filter" className="text-xs text-muted-foreground">Filtrar por Estado</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus} disabled={!isAdmin}>
                <SelectTrigger id="status-filter" className="h-9 bg-background border-input text-foreground">
                  <SelectValue placeholder="Todos los Estados" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border">
                   <SelectItem value="all">Todos los Estados</SelectItem>
                   {AVAILABLE_STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
           </div>
            <Button variant="outline" className="h-9 w-full sm:w-auto border-input hover:bg-accent hover:text-accent-foreground" onClick={handleClearFilters} disabled={!isAdmin}>Limpiar Filtros</Button>
        </CardContent>
      </Card>


      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Usuarios y Permisos</CardTitle>
          <CardDescription className="text-muted-foreground">Gestionar cuentas de usuario, roles y niveles de acceso.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Cargando usuarios...</p>
            </div>
          ) : displayedUsers.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">
                No se encontraron usuarios que coincidan con tus criterios.
              </div>
          ) : (
            <div className="overflow-x-auto">
                <Table>
                <TableCaption className="text-muted-foreground">Lista de usuarios registrados. {displayedUsers.length} usuario(s) encontrado(s).</TableCaption>
              <TableHeader>
                <TableRow className="border-border">
                   <TableHead className="hidden w-[64px] sm:table-cell">
                    <span className="sr-only">Avatar</span>
                  </TableHead>
                  <TableHead className="text-muted-foreground">Nombre</TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">Rol</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                  <TableHead className="text-muted-foreground">Creado En</TableHead>
                  <TableHead><span className="sr-only">Acciones</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedUsers.map((user) => (
                  <TableRow key={user.id} className="border-border hover:bg-muted/50">
                    <TableCell className="hidden sm:table-cell">
                        <Avatar className="h-9 w-9">
                           <AvatarImage src={user.id === currentUser?.uid ? currentUser.photoURL || undefined : undefined} alt={user.displayName || "User"} data-ai-hint="person avatar" />
                           <AvatarFallback className="bg-muted text-muted-foreground">{getInitials(user.displayName, user.email)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                    <TableCell className="font-medium text-foreground">{user.displayName || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="text-muted-foreground">{user.role}</TableCell>
                     <TableCell>
                       <Badge variant={user.status === 'Active' ? 'default' : 'outline'}
                              className={user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700' : 
                                         user.status === 'Inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700' :
                                         user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700' :
                                         'text-muted-foreground border-border'}>
                         {user.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                        {user.createdAt && user.createdAt.toDate ? format(user.createdAt.toDate(), 'yyyy-MM-dd HH:mm') : 'N/A'}
                    </TableCell>
                     <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost" disabled={!isAdmin} className="text-muted-foreground hover:text-foreground hover:bg-accent">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Alternar menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditUser(user)} disabled={!isAdmin} className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">Editar Usuario</DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border"/>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(user)} 
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive hover:!bg-destructive/10 hover:!text-destructive" 
                            disabled={!isAdmin || (currentUser && user.id === currentUser.uid)}
                          >
                            Eliminar Usuario (Firestore)
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
         <CardFooter className="border-t border-border pt-4">
            <div className="text-xs text-muted-foreground">
              Mostrando <strong>{displayedUsers.length}</strong> de <strong>{allUsers.length}</strong> usuarios.
            </div>
         </CardFooter>
      </Card>

      <p className="text-sm text-muted-foreground">
        Gestionar el control de acceso basado en roles y permisos de usuario. Los registros de auditoría rastrean todos los cambios.
        Eliminar un usuario aquí elimina su registro de Firestore; la eliminación completa de Firebase Auth es un proceso separado.
      </p>

      {isAdmin && isUserFormModalOpen && (
        <UserFormModal
            isOpen={isUserFormModalOpen}
            onClose={() => {
                setIsUserFormModalOpen(false);
                setEditingUser(null);
                setIsInviteMode(false);
            }}
            onSubmit={handleSaveUser}
            userData={editingUser}
            isInviteMode={isInviteMode}
            availableRoles={AVAILABLE_ROLES}
            availableStatuses={AVAILABLE_STATUSES}
        />
      )}
      {isAdmin && userToDelete && (
        <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={confirmDeleteUser}
            itemName={userToDelete?.displayName || userToDelete?.email || 'este usuario'}
        />
      )}
    </div>
  );
}
