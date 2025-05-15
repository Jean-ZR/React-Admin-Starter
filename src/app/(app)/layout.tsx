
'use client'; 

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
  ClipboardList,
  DollarSign,
  Activity,
  FileCog,
  SlidersHorizontal,
  UserCog,
  Bell,
  FileText,
  FileBarChart,
  FilePieChart,
  LogOut,
  AlertTriangle, 
  Cog,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  // SidebarInset, // No longer using SidebarInset directly here, it's a main tag now
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarTrigger, 
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context'; 
import { ThemeToggle } from '@/components/theme-toggle'; 
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; 


// Inner layout component that uses the auth context
function AppLayoutContent({ children }: { children: ReactNode }) {
  const { user, loading, logout, role, displayName, isFirebaseConfigured } = useAuth(); 
  const router = useRouter();

  if (!isFirebaseConfigured && !loading) {
    return (
       <div className="flex h-screen items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>
                Firebase is not configured correctly. Please check your `.env.local` file and ensure all `NEXT_PUBLIC_FIREBASE_` variables are set. Authentication and database features will not work.
                <div className="mt-4">
                  <Button variant="outline" onClick={() => window.location.reload()}>Reload Page</Button>
                </div>
            </AlertDescription>
        </Alert>
       </div>
    );
  }

  useEffect(() => {
    if (isFirebaseConfigured && !loading && !user) {
      router.replace('/login'); 
    }
  }, [user, loading, router, isFirebaseConfigured]); 

  if (loading) { 
    return (
      <div className="flex h-screen items-center justify-center">
        Loading Application...
      </div>
    );
  }

   if (!user && isFirebaseConfigured) {
     return <div className="flex h-screen items-center justify-center">Redirecting...</div>;
   }


  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return 'U';
  };


  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <Link
            href="/dashboard" // This link should work for the logo/title
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
        <SidebarContent className="p-2 pr-0"> {/* Added pr-0 to prevent scrollbar overlap in icon mode */}
          <SidebarMenu>
            {/* Dashboard */}
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard" isActive={router.pathname === '/dashboard'}> {/* Ensure Link is used here */}
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
                 <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/settings/account">
                    <Cog /> Account Settings
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
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
        <SidebarFooter className="p-4 mt-auto"> {/* Ensure footer is at the bottom */}
          <span className="text-xs text-muted-foreground">
            © 2024 React Admin Starter
          </span>
        </SidebarFooter>
      </Sidebar>

      <main className="flex flex-1 flex-col min-h-0"> {/* flex-1 and flex-col for main area */}
         <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
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
                        <AvatarImage src={user?.photoURL || undefined} alt={displayName || user?.email || "User"} data-ai-hint="person avatar" />
                         <AvatarFallback>{getInitials(displayName, user?.email)}</AvatarFallback>
                    </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{displayName || user?.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/settings/account">Settings</Link>
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
        <div className="flex-1 p-4 sm:px-6 sm:py-4 overflow-auto"> {/* Content area with padding and scroll */}
          {children}
        </div>
      </main>
    </div>
  );
}

// Main export for the layout
export default function AppLayout({ children }: { children: ReactNode }) {
  // AuthProvider is in the root layout (src/app/layout.tsx)
  return <AppLayoutContent>{children}</AppLayoutContent>;
}
