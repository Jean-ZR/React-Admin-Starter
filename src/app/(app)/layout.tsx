// Wrap the layout content with AuthProvider
// Check auth status and redirect if not logged in
// Add conditional rendering based on role (example: User Management for admin)
// Update header to include user dropdown and logout

'use client'; // Make this a client component to use hooks

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Package,
  Users,
  Warehouse,
  Wrench,
  AreaChart,
  Settings,
  List,
  Tags,
  BarChart3,
  BookUser,
  Globe,
  History,
  Boxes,
  ArrowRightLeft,
  BellRing,
  LineChart,
  BookOpen,
  CalendarDays,
  ScrollText,
  DollarSign,
  Activity,
  FileCog,
  SlidersHorizontal,
  UserCog,
  Bell,
  FileText,
  FileBarChart,
  FilePieChart,
  ClipboardList,
  LogOut,
  UserCircle,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarTrigger, // Import SidebarTrigger
} from '@/components/ui/sidebar';
// Removed DashboardHeader import as it's no longer needed
import { Separator } from '@/components/ui/separator';
import { AuthProvider, useAuth } from '@/contexts/auth-context'; // Import AuthProvider and useAuth
import { ThemeToggle } from '@/components/theme-toggle'; // Import ThemeToggle
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Inner layout component that uses the auth context
function AppLayoutContent({ children }: { children: ReactNode }) {
  const { user, loading, logout, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // You can render a loading spinner here
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // Determine user initials for AvatarFallback
  const getInitials = (email: string | null | undefined) => {
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-foreground hover:text-foreground/80"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <line x1="3" x2="21" y1="9" y2="9" />
              <line x1="9" x2="9" y1="21" y2="9" />
            </svg>
            <h2 className="text-lg font-semibold tracking-tight">
              Admin Starter
            </h2>
          </Link>
        </SidebarHeader>
        <Separator />
        <SidebarContent className="p-2 pr-0">
          <SidebarMenu>
            {/* Dashboard */}
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard">
                <Home />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Asset Management */}
            <SidebarGroup>
              <SidebarGroupLabel>
                <Package /> Asset Management
              </SidebarGroupLabel>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/assets/list">
                    <List /> Asset List
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/assets/categories">
                    <Tags /> Categories
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/assets/reports">
                    <FileBarChart /> Asset Reports
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarGroup>

            {/* Client Management */}
            <SidebarGroup>
              <SidebarGroupLabel>
                <Users /> Client Management
              </SidebarGroupLabel>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/clients/directory">
                    <BookUser /> Directory
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/clients/portal">
                    <Globe /> Portal
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/clients/history">
                    <History /> History
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarGroup>

            {/* Inventory Control */}
            <SidebarGroup>
              <SidebarGroupLabel>
                <Warehouse /> Inventory Control
              </SidebarGroupLabel>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/inventory/stock">
                    <Boxes /> Stock Management
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/inventory/movements">
                    <ArrowRightLeft /> Stock Movement
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/inventory/alerts">
                    <BellRing /> Low Stock Alerts
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/inventory/reports">
                    <FilePieChart /> Inventory Reports
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarGroup>

            {/* Service Management */}
            <SidebarGroup>
              <SidebarGroupLabel>
                <Wrench /> Service Management
              </SidebarGroupLabel>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/services/catalog">
                    <BookOpen /> Service Catalog
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/services/scheduling">
                    <CalendarDays /> Scheduling
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/services/history">
                    <ClipboardList /> Service History
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarGroup>

            {/* Reporting System */}
            <SidebarGroup>
              <SidebarGroupLabel>
                <AreaChart /> Reporting System
              </SidebarGroupLabel>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/reports/financial">
                    <DollarSign /> Financial Reports
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/reports/operational">
                    <Activity /> Operational Reports
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/reports/custom">
                    <FileCog /> Custom Reports
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarGroup>

            <SidebarSeparator />

            {/* System Settings */}
            <SidebarGroup>
              <SidebarGroupLabel>
                <Settings /> System Settings
              </SidebarGroupLabel>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/settings/general">
                    <SlidersHorizontal /> General Config
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                {/* Example: Show User Management only to Admins */}
                {role === 'admin' && (
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton href="/settings/users">
                      <UserCog /> User Management
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )}
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/settings/notifications">
                    <Bell /> Notifications
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/settings/logs">
                    <FileText /> System Logs
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarGroup>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto">
          <span className="text-xs text-muted-foreground">
            © 2024 React Admin Starter
          </span>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col sm:gap-4 sm:py-4">
        {/* Updated DashboardHeader with User Dropdown */}
         <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="sm:hidden" />
            <div className="ml-auto flex items-center gap-4">
                <ThemeToggle />
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                    variant="outline"
                    size="icon"
                    className="overflow-hidden rounded-full"
                    >
                    <Avatar className="h-8 w-8">
                        {/* Add AvatarImage if you store user photo URLs */}
                        {/* <AvatarImage src={user.photoURL || undefined} alt="User Avatar" /> */}
                         <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                    </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <UserCircle className="mr-2 h-4 w-4" />
                         Profile (Not implemented)
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings (Not implemented)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                         Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}

// Export the layout wrapped in the AuthProvider
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </AuthProvider>
  );
}
