import { Home, Package, Settings, Users } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { SampleDataGrid } from '@/components/sample-data-grid';
import { DashboardHeader } from '@/components/dashboard-header';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image'; // Import next/image

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar>
        <SidebarHeader className="p-4">
           {/* Placeholder Logo/Title */}
           <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <line x1="3" x2="21" y1="9" y2="9"/>
              <line x1="9" x2="9" y1="21" y2="9"/>
            </svg>
             <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Admin Starter
            </h2>
           </div>
        </SidebarHeader>
         <Separator />
        <SidebarContent className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" isActive={true}>
                <Home />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Package />
                Assets
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Users />
                Clients
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto">
          {/* Optional Footer Content */}
          <span className="text-xs text-muted-foreground">© 2024 React Admin Starter</span>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col sm:gap-4 sm:py-4">
        <DashboardHeader />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <h1 className="text-2xl font-semibold leading-none tracking-tight mb-4">
            Dashboard Overview
          </h1>
          <SampleDataGrid />
           {/* Example Placeholder Card */}
           <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                   <h3 className="tracking-tight text-sm font-medium">Total Assets</h3>
                    <Package className="h-4 w-4 text-muted-foreground" />
                 </div>
                 <div className="p-6 pt-0">
                   <div className="text-2xl font-bold">7</div>
                   <p className="text-xs text-muted-foreground">+2 since last month</p>
                 </div>
             </div>
             {/* Add more placeholder cards if needed */}
          </div>
        </main>
      </SidebarInset>
    </div>
  );
}
