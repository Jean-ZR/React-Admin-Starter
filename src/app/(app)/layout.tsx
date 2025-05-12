import type { ReactNode } from 'react';
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
  FileBarChart, // Added for Asset Reports
  FilePieChart, // Added for Inventory Reports
  ClipboardList, // Added for Service History
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
} from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link'; // Import Link for navigation

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-foreground hover:text-foreground/80">
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
        <SidebarContent className="p-2 pr-0"> {/* Adjusted padding */}
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
                     <List/> Asset List
                   </SidebarMenuSubButton>
                 </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/assets/categories">
                     <Tags/> Categories
                   </SidebarMenuSubButton>
                 </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/assets/reports">
                     <FileBarChart/> Asset Reports
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
                     <BookUser/> Directory
                   </SidebarMenuSubButton>
                 </SidebarMenuSubItem>
                 <SidebarMenuSubItem>
                   <SidebarMenuSubButton href="/clients/portal">
                     <Globe/> Portal
                   </SidebarMenuSubButton>
                 </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                   <SidebarMenuSubButton href="/clients/history">
                     <History/> History
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
                     <Boxes/> Stock Management
                   </SidebarMenuSubButton>
                 </SidebarMenuSubItem>
                 <SidebarMenuSubItem>
                   <SidebarMenuSubButton href="/inventory/movements">
                     <ArrowRightLeft/> Stock Movement
                   </SidebarMenuSubButton>
                 </SidebarMenuSubItem>
                 <SidebarMenuSubItem>
                   <SidebarMenuSubButton href="/inventory/alerts">
                     <BellRing/> Low Stock Alerts
                   </SidebarMenuSubButton>
                 </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                   <SidebarMenuSubButton href="/inventory/reports">
                     <FilePieChart/> Inventory Reports
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
                     <BookOpen/> Service Catalog
                   </SidebarMenuSubButton>
                 </SidebarMenuSubItem>
                 <SidebarMenuSubItem>
                   <SidebarMenuSubButton href="/services/scheduling">
                     <CalendarDays/> Scheduling
                   </SidebarMenuSubButton>
                 </SidebarMenuSubItem>
                 <SidebarMenuSubItem>
                   <SidebarMenuSubButton href="/services/history">
                     <ClipboardList/> Service History
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
                     <DollarSign/> Financial Reports
                   </SidebarMenuSubButton>
                 </SidebarMenuSubItem>
                 <SidebarMenuSubItem>
                   <SidebarMenuSubButton href="/reports/operational">
                     <Activity/> Operational Reports
                   </SidebarMenuSubButton>
                 </SidebarMenuSubItem>
                 <SidebarMenuSubItem>
                   <SidebarMenuSubButton href="/reports/custom">
                     <FileCog/> Custom Reports
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
                     <SlidersHorizontal/> General Config
                   </SidebarMenuSubButton>
                 </SidebarMenuSubItem>
                 <SidebarMenuSubItem>
                   <SidebarMenuSubButton href="/settings/users">
                     <UserCog/> User Management
                   </SidebarMenuSubButton>
                 </SidebarMenuSubItem>
                 <SidebarMenuSubItem>
                   <SidebarMenuSubButton href="/settings/notifications">
                     <Bell/> Notifications
                   </SidebarMenuSubButton>
                 </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                   <SidebarMenuSubButton href="/settings/logs">
                     <FileText/> System Logs
                   </SidebarMenuSubButton>
                 </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarGroup>

          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto">
          {/* Optional Footer Content */}
          <span className="text-xs text-muted-foreground">
            © 2024 React Admin Starter
          </span>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col sm:gap-4 sm:py-4">
        <DashboardHeader />
        {/* Main content area for each page */}
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
