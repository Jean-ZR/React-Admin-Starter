
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
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase/config';
import {
  collection,
  getDocs,
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


const AVAILABLE_ROLES = ['Administrator', 'Teacher', 'Student', 'Read Only', 'Manager']; // Extended list
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

  // Fetch users from Firestore
  const fetchUsers = useCallback(() => {
    if (!isAdmin) {
      setIsLoading(false);
      // toast({ title: "Access Denied", description: "You don't have permission to manage users.", variant: "destructive"});
      return () => {}; // Return an empty unsubscribe function
    }
    setIsLoading(true);
    const usersCollectionRef = collection(db, 'users');
    let q = query(usersCollectionRef, orderBy('displayName', 'asc'));

    const queryConstraints = [];
    if (filterRole !== 'all') {
      queryConstraints.push(where('role', '==', filterRole));
    }
    if (filterStatus !== 'all') {
      queryConstraints.push(where('status', '==', filterStatus));
    }
    if(queryConstraints.length > 0){
        q = query(usersCollectionRef, ...queryConstraints, orderBy('displayName', 'asc'));
    }


    const unsubscribe = onSnapshot(q, (snapshot) => {
      let usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<UserData, 'id'>),
      }));
      
      setAllUsers(usersData); // Store all users before client-side search
      setDisplayedUsers(usersData); // Initially display all fetched users
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

  // Client-side search based on allUsers
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
    // Prevent current user from deleting themselves from this UI
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
      // Note: This only deletes from Firestore. Firebase Auth user deletion is separate & more complex.
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
      // Conceptual: In a real app, this would trigger a backend function or more complex invite flow.
      console.log("Invite user data (conceptual):", formData);
      toast({ title: "Conceptual Invite", description: `Invitation for ${formData.email} with role ${formData.role} would be processed here.`});
    } else if (editingUser) {
      // Update existing user in Firestore
      try {
        const userDocRef = doc(db, 'users', editingUser.id);
        await updateDoc(userDocRef, {
          displayName: formData.displayName,
          // email: formData.email, // Email typically not changed this way
          role: formData.role,
          status: formData.status,
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Success", description: "User details updated successfully." });
      } catch (error) {
        console.error("Error updating user:", error);
        toast({ title: "Error", description: "Could not update user details.", variant: "destructive" });
        throw error; // Re-throw to keep modal open on error
      }
    }
    setIsUserFormModalOpen(false);
    setEditingUser(null);
    setIsInviteMode(false);
  };
  
  const handleApplyFilters = () => {
    // fetchUsers is re-called due to dependency on filterRole/filterStatus
    // For a purely client-side filter approach on `allUsers`, you'd implement that here.
    // But since we want to query Firestore, fetchUsers handles it.
    toast({ title: "Filters Applied", description: "Fetching users with selected filters." });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setFilterStatus('all');
    // fetchUsers will be re-called.
    toast({ title: "Filters Cleared", description: "Showing all users." });
  };

  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return 'U';
  };
  

  if (!isAdmin && !isLoading) { // Check isLoading to avoid flicker
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">User Management</h1>
        <Card>
          <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
          <CardContent><p>You do not have permission to manage users.</p></CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">
          User Management
        </h1>
         <div className="flex gap-2 items-center w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users (name, email)..."
              className="pl-8 sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!isAdmin}
            />
          </div>
          <Button size="sm" className="h-9 gap-1" onClick={handleInviteUser} disabled={!isAdmin}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Invite User</span>
          </Button>
         </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5"/> Filter Users</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="role-filter" className="text-xs">Filter by Role</Label>
              <Select value={filterRole} onValueChange={setFilterRole} disabled={!isAdmin}>
                <SelectTrigger id="role-filter" className="h-9">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">All Roles</SelectItem>
                   {AVAILABLE_ROLES.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                </SelectContent>
              </Select>
           </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="status-filter" className="text-xs">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus} disabled={!isAdmin}>
                <SelectTrigger id="status-filter" className="h-9">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">All Statuses</SelectItem>
                   {AVAILABLE_STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
           </div>
            <Button variant="outline" className="h-9 w-full sm:w-auto" onClick={handleClearFilters} disabled={!isAdmin}>Clear Filters</Button>
            {/* Apply Filters button is implicit as filters trigger re-fetch. Can add explicit button if preferred. */}
            {/* <Button className="h-9 w-full sm:w-auto" onClick={handleApplyFilters} disabled={!isAdmin}>Apply Filters</Button> */}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Users & Permissions</CardTitle>
          <CardDescription>Manage user accounts, roles, and access levels.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading users...</p>
            </div>
          ) : displayedUsers.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">
                No users found matching your criteria.
              </div>
          ) : (
            <Table>
                <TableCaption>A list of registered users. {displayedUsers.length} user(s) found.</TableCaption>
              <TableHeader>
                <TableRow>
                   <TableHead className="hidden w-[64px] sm:table-cell">
                    <span className="sr-only">Avatar</span>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="hidden sm:table-cell">
                        <Avatar className="h-9 w-9">
                           <AvatarImage src={user.id === currentUser?.uid ? currentUser.photoURL || undefined : undefined} alt={user.displayName || "User"} data-ai-hint="person avatar" />
                           <AvatarFallback>{getInitials(user.displayName, user.email)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                    <TableCell className="font-medium">{user.displayName || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                     <TableCell>
                       <Badge variant={user.status === 'Active' ? 'default' : 'outline'}
                              className={user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                                         user.status === 'Inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                         user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                         'text-muted-foreground'}>
                         {user.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                        {user.createdAt && user.createdAt.toDate ? format(user.createdAt.toDate(), 'yyyy-MM-dd HH:mm') : 'N/A'}
                    </TableCell>
                     <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost" disabled={!isAdmin}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditUser(user)} disabled={!isAdmin}>Edit User</DropdownMenuItem>
                          {/* Placeholder for more actions */}
                          {/* <DropdownMenuItem disabled={!isAdmin}>Reset Password (Not Impl.)</DropdownMenuItem> */}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(user)} 
                            className="text-destructive" 
                            disabled={!isAdmin || (currentUser && user.id === currentUser.uid)}
                          >
                            Delete User (Firestore)
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
         <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>{displayedUsers.length}</strong> of <strong>{allUsers.length}</strong> users.
            </div>
         </CardFooter>
      </Card>

      <p className="text-sm text-muted-foreground">
        Manage role-based access control and user permissions. Audit logs track all changes.
        Deleting a user here removes their Firestore record; full Firebase Auth deletion is a separate process.
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
            itemName={userToDelete?.displayName || userToDelete?.email || 'this user'}
        />
      )}
    </div>
  );
}
