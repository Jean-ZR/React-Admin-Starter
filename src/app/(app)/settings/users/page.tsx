import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const users = [
  { id: 'USR001', name: 'Alice Johnson', email: 'alice.j@example.com', role: 'Administrator', status: 'Active', lastLogin: '2024-07-21 10:00 AM', avatar: 'https://picsum.photos/40/40?random=11', dataAiHint: 'woman portrait' },
  { id: 'USR002', name: 'Bob Williams', email: 'bob.w@example.com', role: 'Support Staff', status: 'Active', lastLogin: '2024-07-20 02:30 PM', avatar: 'https://picsum.photos/40/40?random=12', dataAiHint: 'man portrait' },
  { id: 'USR003', name: 'Charlie Brown', email: 'charlie.b@example.com', role: 'Read Only', status: 'Inactive', lastLogin: '2024-06-15 09:00 AM', avatar: 'https://picsum.photos/40/40?random=13', dataAiHint: 'person face' },
  { id: 'USR004', name: 'David Lee', email: 'david.l@example.com', role: 'Support Staff', status: 'Active', lastLogin: '2024-07-21 08:15 AM', avatar: 'https://picsum.photos/40/40?random=14', dataAiHint: 'man smiling' },
];

export default function UserManagementPage() {
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
              placeholder="Search users..."
              className="pl-8 sm:w-[300px]"
            />
          </div>
          <Button size="sm" className="h-9 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Invite User</span>
          </Button>
         </div>
      </div>

      {/* Filters */}
      <Card className="pt-4">
        <CardContent className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="role-filter" className="text-xs">Filter by Role</Label>
              <Select>
                <SelectTrigger id="role-filter" className="h-9">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">All Roles</SelectItem>
                   <SelectItem value="admin">Administrator</SelectItem>
                   <SelectItem value="support">Support Staff</SelectItem>
                   <SelectItem value="readonly">Read Only</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
           </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="status-filter" className="text-xs">Filter by Status</Label>
              <Select>
                <SelectTrigger id="status-filter" className="h-9">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">All Statuses</SelectItem>
                   <SelectItem value="active">Active</SelectItem>
                   <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending Invitation</SelectItem>
                </SelectContent>
              </Select>
           </div>
            <Button variant="outline" className="h-9 w-full sm:w-auto">Clear Filters</Button>
            <Button className="h-9 w-full sm:w-auto">Apply Filters</Button>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Users & Permissions</CardTitle>
          <CardDescription>Manage user accounts, roles, and access levels.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                 <TableHead className="hidden w-[80px] sm:table-cell">
                  <span className="sr-only">Avatar</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                 <TableHead>Last Login</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="hidden sm:table-cell">
                      <Avatar className="h-9 w-9">
                         <AvatarImage src={user.avatar} alt="Avatar" data-ai-hint={user.dataAiHint} />
                         <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                   <TableCell>
                     <Badge variant={user.status === 'Active' ? 'default' : 'outline'}
                            className={user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'text-muted-foreground'}>
                       {user.status}
                     </Badge>
                  </TableCell>
                   <TableCell className="text-xs text-muted-foreground">{user.lastLogin}</TableCell>
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
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                         <DropdownMenuItem>{user.status === 'Active' ? 'Deactivate' : 'Activate'}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Reset Password</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>1-4</strong> of <strong>{users.length}</strong> users
            </div>
         </CardFooter>
      </Card>

      <p className="text-sm text-muted-foreground">
        Manage role-based access control and user permissions. Audit logs track all changes.
      </p>
    </div>
  );
}
