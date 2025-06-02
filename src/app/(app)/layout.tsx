
'use client';

import type { ReactNode } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Truck,
  Users,
  Package,
  Wrench,
  BarChart3, // Changed for Reports main icon
  FileText,
  Settings,
  HelpCircle,
  Bell as BellIcon,
  Home,
  UserCog,
  LogOut,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Palette,
  // BarChart, // Replaced by BarChart3 for main 'Reports'
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from '@/contexts/auth-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


interface NavSubItem {
  label: string;
  href: string;
  id: string;
}
interface NavItem {
  icon: React.ElementType;
  label: string;
  id: string;
  href: string;
  fields?: number;
  subItems?: NavSubItem[];
}

interface NavModule {
  category: string;
  items: NavItem[];
}

const navigationModules: NavModule[] = [
  {
    category: "PANEL",
    items: [
        { icon: Home, label: 'Dashboard', id: 'dashboard', href: '/dashboard' },
    ]
  },
  {
    category: 'GESTIÓN',
    items: [
      {
        icon: Truck, label: 'Activos', id: 'assets', href: '/assets/list',
        subItems: [
          { label: 'Lista', href: '/assets/list', id: 'assets-list'},
          { label: 'Categorías', href: '/assets/categories', id: 'assets-categories'},
          { label: 'Reportes', href: '/assets/reports', id: 'assets-reports'},
        ]
      },
      {
        icon: Users, label: 'Clientes', id: 'clients', href: '/clients/directory',
        subItems: [
          { label: 'Directorio', href: '/clients/directory', id: 'clients-directory'},
          { label: 'Portal', href: '/clients/portal', id: 'clients-portal'},
          { label: 'Historial', href: '/clients/history', id: 'clients-history'},
        ]
      },
      {
        icon: Package, label: 'Inventario', id: 'inventory', href: '/inventory/stock',
        subItems: [
            { label: 'Stock', href: '/inventory/stock', id: 'inventory-stock'},
            { label: 'Movimientos', href: '/inventory/movements', id: 'inventory-movements'},
            { label: 'Alertas', href: '/inventory/alerts', id: 'inventory-alerts'},
            { label: 'Reportes', href: '/inventory/reports', id: 'inventory-reports'},
        ]
      },
      {
        icon: Wrench, label: 'Servicios', id: 'services', href: '/services/catalog',
        subItems: [
          { label: 'Catálogo', href: '/services/catalog', id: 'services-catalog'},
          { label: 'Programación', href: '/services/scheduling', id: 'services-scheduling'},
          { label: 'Historial', href: '/services/history', id: 'services-history'},
        ]
      },
    ],
  },
  {
    category: 'ANÁLISIS',
    items: [
      {
        icon: BarChart3, label: 'Reportes', id: 'analysis_reports', href: '/reports/financial',
        subItems: [
          { label: 'Financieros', href: '/reports/financial', id: 'reports-financial' },
          { label: 'Operacionales', href: '/reports/operational', id: 'reports-operational' },
          { label: 'Personalizados', href: '/reports/custom', id: 'reports-custom' },
        ]
      },
    ],
  },
  {
    category: 'CONFIGURACIÓN',
    items: [
      {
        icon: Settings, label: 'Ajustes', id: 'settings', href: '/settings/general',
        subItems: [
            { label: 'General', href: '/settings/general', id: 'settings-general' },
            { label: 'Cuenta', href: '/settings/account', id: 'settings-account' },
            { label: 'Usuarios', href: '/settings/users', id: 'settings-users' },
            { label: 'Notificaciones', href: '/settings/notifications', id: 'settings-notifications' },
            { label: 'Logs del Sistema', href: '/settings/logs', id: 'settings-logs' },
        ]
      },
      { icon: HelpCircle, label: 'Soporte', id: 'support', href: '/dashboard' },
    ],
  },
];

const pageTitles: { [key: string]: { title: string; subtitle: string } } = {
  '/dashboard': { title: 'Panel de Control', subtitle: 'Resumen de gestión' },
  '/assets/list': { title: 'Lista de Activos', subtitle: 'Gestión de inventario de activos' },
  '/assets/categories': { title: 'Categorías de Activos', subtitle: 'Organiza tus activos' },
  '/assets/reports': { title: 'Reportes de Activos', subtitle: 'Análisis de datos de activos' },
  '/clients/directory': { title: 'Directorio de Clientes', subtitle: 'Administra tus clientes' },
  '/clients/portal': { title: 'Portal del Cliente', subtitle: 'Interacciones y servicios' },
  '/clients/history': { title: 'Historial del Cliente', subtitle: 'Registro de transacciones' },
  '/inventory/stock': { title: 'Gestión de Stock', subtitle: 'Seguimiento de inventario' },
  '/inventory/movements': { title: 'Movimientos de Stock', subtitle: 'Registro de entradas y salidas' },
  '/inventory/alerts': { title: 'Alertas de Stock Bajo', subtitle: 'Notificaciones de inventario' },
  '/inventory/reports': { title: 'Reportes de Inventario', subtitle: 'Análisis de stock' },
  '/services/catalog': { title: 'Catálogo de Servicios', subtitle: 'Servicios ofrecidos' },
  '/services/scheduling': { title: 'Programación de Servicios', subtitle: 'Calendario y citas' },
  '/services/history': { title: 'Historial de Servicios', subtitle: 'Registro de trabajos' },
  '/reports/financial': { title: 'Reportes Financieros', subtitle: 'Análisis de ingresos y gastos' },
  '/reports/operational': { title: 'Reportes Operacionales', subtitle: 'Métricas de rendimiento' },
  '/reports/custom': { title: 'Reportes Personalizados', subtitle: 'Crea tus propios reportes y gráficas' },
  '/settings/general': { title: 'Configuración General', subtitle: 'Parámetros del sistema' },
  '/settings/account': { title: 'Configuración de Cuenta', subtitle: 'Preferencias personales' },
  '/settings/users': { title: 'Gestión de Usuarios', subtitle: 'Control de acceso y roles' },
  '/settings/notifications': { title: 'Configuración de Notificaciones', subtitle: 'Alertas y avisos' },
  '/settings/logs': { title: 'Registros del Sistema', subtitle: 'Actividad y eventos' },
  '/profile': { title: 'Perfil de Usuario', subtitle: 'Gestiona tu información personal' },
};


function AppLayoutContent({ children }: { children: ReactNode }) {
  const { user, loading, logout, role, displayName, isFirebaseConfigured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [activeSubItemId, setActiveSubItemId] = useState<string | null>(null);
  const [activeAccordionValue, setActiveAccordionValue] = useState<string | undefined>(undefined);


  useEffect(() => {
    let currentActiveSubId: string | null = null;
    let currentModuleIdForAccordion: string | undefined = undefined;

    for (const modGroup of navigationModules) {
      for (const item of modGroup.items) {
        if (item.subItems) {
          const isParentActiveOrSubItemActive = item.subItems.some(subItem => pathname === subItem.href || pathname.startsWith(subItem.href + "/")) || pathname === item.href || pathname.startsWith(item.href + "/");

          if (isParentActiveOrSubItemActive) {
            currentModuleIdForAccordion = item.id;
            // Find the specific active sub-item
            const activeSub = item.subItems.find(subItem => pathname === subItem.href || pathname.startsWith(subItem.href + "/"));
            if (activeSub) {
              currentActiveSubId = activeSub.id;
            } else if (pathname === item.href || pathname.startsWith(item.href + "/")) {
              // If parent is active but no specific sub-item, default to first sub-item or parent ID
              currentActiveSubId = item.subItems[0]?.id || item.id;
            }
            break; 
          }
        } else if (pathname === item.href || pathname.startsWith(item.href + "/")) {
          currentActiveSubId = item.id;
          currentModuleIdForAccordion = undefined; // Not an accordion item
          break;
        }
      }
      if (currentActiveSubId) break; 
    }

    // Fallbacks for non-module specific pages if no specific active sub-item was found from modules
    if (!currentActiveSubId) {
        if (pathname.startsWith('/settings/')) { // Special handling for settings if no specific sub-item matched directly
            currentActiveSubId = 'settings-general'; // Default or derive from path
            currentModuleIdForAccordion = 'settings';
        } else if (pathname.startsWith('/reports/')) {
             currentActiveSubId = 'reports-financial'; // Default or derive
             currentModuleIdForAccordion = 'analysis_reports';
        } else if (pathname.startsWith('/profile')) {
            currentActiveSubId = 'profile'; 
        } else if (pathname.startsWith('/dashboard')) {
            currentActiveSubId = 'dashboard';
        }
    }
    
    setActiveSubItemId(currentActiveSubId);
    setActiveAccordionValue(currentModuleIdForAccordion);

  }, [pathname]);


  if (!isFirebaseConfigured && !loading) {
    return (
      <div className="flex h-screen items-center justify-center p-4 bg-background">
        <Alert variant="destructive" className="max-w-lg bg-card text-card-foreground">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error de Configuración</AlertTitle>
          <AlertDescription>
            Firebase no está configurado correctamente. Por favor, revisa tu archivo `.env.local`
            y asegúrate que todas las variables `NEXT_PUBLIC_FIREBASE_` estén correctas.
            <div className="mt-4">
              <Button variant="outline" onClick={() => window.location.reload()}>Recargar Página</Button>
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

  if (loading || (!user && isFirebaseConfigured)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        Cargando Aplicación...
      </div>
    );
  }

  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1 && parts[0] && parts[parts.length -1]) {
        return (parts[0][0] + parts[parts.length -1][0]).toUpperCase();
      } else if (parts[0] && parts[0].length >=2) {
        return parts[0].substring(0, 2).toUpperCase();
      } else if (parts[0]) {
         return parts[0][0].toUpperCase();
      }
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return 'UP';
  };

  const currentPageInfo = pageTitles[pathname] || { title: 'Admin', subtitle: 'Bienvenido' };


  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-6 flex flex-col shrink-0">
        <Link href="/dashboard" className="flex items-center mb-10">
          <div className="w-12 h-12 bg-sidebar-primary rounded-xl flex items-center justify-center text-sidebar-primary-foreground mr-3 shrink-0">
            <Truck size={24} />
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">Sistema</div>
            <div className="text-sm text-muted-foreground">Gestión Integral</div>
          </div>
        </Link>

        <nav className="flex-1 overflow-y-auto pr-0">
         <Accordion
            type="single"
            collapsible
            value={activeAccordionValue}
            onValueChange={setActiveAccordionValue}
            className="w-full"
          >
            {navigationModules.map((section, idx) => (
              <div key={section.category + idx} className="mb-2">
                <div className="text-xs font-semibold text-muted-foreground mb-2 px-3 uppercase tracking-wider">
                  {section.category}
                </div>
                {section.items.map((item) => (
                  item.subItems ? (
                    <AccordionItem value={item.id} key={item.id} className="border-none">
                      <AccordionTrigger
                        className={`
                          flex items-center w-full p-3 rounded-xl mb-1 cursor-pointer transition-colors group
                          ${(activeAccordionValue === item.id) ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'}
                        `}
                      >
                        <div className="flex items-center flex-1">
                          <item.icon className={`mr-3 ${(activeAccordionValue === item.id) ? 'text-sidebar-accent-foreground' : 'text-muted-foreground group-hover:text-sidebar-foreground'}`} size={20} />
                          <span className="flex-1">{item.label}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-5 pt-1 pb-1 border-l-2 border-sidebar-accent/50 ml-3">
                        {item.subItems.map(subItem => (
                          <Link
                            href={subItem.href}
                            key={subItem.id}
                            className={`
                              flex items-center py-2 px-3 rounded-md text-sm transition-colors
                              ${activeSubItemId === subItem.id
                                ? 'text-sidebar-primary font-medium bg-sidebar-accent/60'
                                : 'text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/30'}
                            `}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <Link
                      href={item.href}
                      key={item.id}
                      className={`
                        flex items-center p-3 rounded-xl mb-1.5 cursor-pointer transition-colors group
                        ${activeSubItemId === item.id
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'}
                      `}
                      onClick={() => {
                        // If it's not an accordion item, ensure no accordion is active
                        if (activeAccordionValue !== undefined) setActiveAccordionValue(undefined);
                        setActiveSubItemId(item.id);
                      }}
                    >
                      <item.icon className={`mr-3 ${activeSubItemId === item.id ? 'text-sidebar-accent-foreground' : 'text-muted-foreground group-hover:text-sidebar-foreground'}`} size={20} />
                      <span className="flex-1">{item.label}</span>
                      {item.fields && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                          {item.fields}
                        </span>
                      )}
                    </Link>
                  )
                ))}
              </div>
            ))}
          </Accordion>
        </nav>
         <div className="mt-auto pt-6 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center p-2 rounded-lg hover:bg-sidebar-accent/50 cursor-pointer group">
                    <Avatar className="h-10 w-10 mr-3">
                       <AvatarImage src={user?.photoURL || undefined} alt={displayName || user?.email || "User"} data-ai-hint="person avatar"/>
                       <AvatarFallback className="bg-sidebar-primary/20 text-sidebar-primary font-semibold">
                         {getInitials(displayName, user?.email)}
                       </AvatarFallback>
                     </Avatar>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-foreground group-hover:text-accent-foreground">
                            {displayName || user?.email?.split('@')[0]}
                        </div>
                        <div className="text-xs text-muted-foreground group-hover:text-accent-foreground/80">
                            {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Usuario'}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="mb-2 w-56 bg-popover border-border shadow-lg text-popover-foreground">
                  <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2 cursor-pointer hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">
                          <UserCog size={16}/> Perfil
                      </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                      <Link href="/settings/account" className="flex items-center gap-2 cursor-pointer hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">
                          <Settings size={16}/> Ajustes
                      </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <ThemeToggle />
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2 cursor-pointer hover:!bg-destructive/10 hover:!text-destructive dark:hover:!bg-destructive/20 dark:focus:!bg-destructive/20">
                      <LogOut size={16}/> Cerrar Sesión
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      <main className="flex flex-1 flex-col min-h-0">
        <div className="flex justify-between items-center p-6 sm:p-8 border-b border-border shrink-0 bg-card">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{currentPageInfo.title}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">{currentPageInfo.subtitle}</p>
          </div>
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="relative cursor-pointer group">
              <BellIcon className="text-muted-foreground group-hover:text-primary transition-colors" size={24} />
              <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-card">
                3
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 p-6 sm:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppLayoutContent>{children}</AppLayoutContent>;
}
