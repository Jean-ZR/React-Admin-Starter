
'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Truck,
  Users,
  Package,
  Wrench,
  BarChart3,
  FileText as FileTextIcon, // Renamed to avoid conflict
  Settings as SettingsIcon, // Renamed
  HelpCircle,
  Bell as BellIcon, // Renamed
  Home,
  List,
  Tags,
  FileBarChart,
  BookUser,
  Globe,
  History,
  Boxes,
  ArrowRightLeft,
  BellRing,
  FilePieChart,
  BookOpen,
  CalendarDays,
  ClipboardList,
  DollarSign,
  Activity,
  FileCog,
  SlidersHorizontal,
  UserCog,
  LogOut,
  AlertTriangle,
  Cog,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface NavItem {
  icon: React.ElementType;
  label: string;
  id: string;
  href: string;
  fields?: number; // Optional count
  subItems?: NavItem[]; // For potential future sub-menus, though new design is flat
}

interface NavModule {
  category: string;
  items: NavItem[];
}

// Mapping new design to existing routes
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
      { icon: Truck, label: 'Activos', id: 'assets', href: '/assets/list', fields: 42 }, // Example count
      { icon: Users, label: 'Clientes', id: 'clients', href: '/clients/directory', fields: 11 },
      { icon: Package, label: 'Inventario', id: 'inventory', href: '/inventory/stock', fields: 12 },
      { icon: Wrench, label: 'Servicios', id: 'services', href: '/services/catalog' },
    ],
  },
  {
    category: 'ANÁLISIS',
    items: [
      // { icon: BarChart3, label: 'Gráficas', id: 'graficas', href: '/reports/custom' }, // Assuming 'Gráficas' maps to custom reports or a new charts page
      { icon: FileTextIcon, label: 'Reportes', id: 'reports', href: '/reports/financial' }, // Default to financial reports
    ],
  },
  {
    category: 'CONFIGURACIÓN',
    items: [
      { icon: SettingsIcon, label: 'Ajustes', id: 'settings', href: '/settings/general' },
      // { icon: HelpCircle, label: 'Soporte', id: 'support', href: '/support' }, // Assuming a future support page
    ],
  },
];

// Simplified mapping for top bar title, can be expanded
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
  '/reports/custom': { title: 'Reportes Personalizados', subtitle: 'Crea tus propios reportes' },
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
  const pathname = usePathname(); // Get current path

  const [activeModuleId, setActiveModuleId] = useState('dashboard');

  useEffect(() => {
    // Determine active module based on pathname
    let currentModule = 'dashboard'; // Default
    for (const modGroup of navigationModules) {
      for (const item of modGroup.items) {
        if (pathname.startsWith(item.href)) {
          currentModule = item.id;
          break;
        }
      }
      if (currentModule !== 'dashboard') break;
    }
    // Specific handling for settings and profile sub-pages
    if (pathname.startsWith('/settings/')) currentModule = 'settings';
    if (pathname.startsWith('/profile')) currentModule = 'profile'; // Or manage this separately if profile isn't in sidebar

    setActiveModuleId(currentModule);
  }, [pathname]);

  if (!isFirebaseConfigured && !loading) {
    return (
      <div className="flex h-screen items-center justify-center p-4 bg-slate-50">
        <Alert variant="destructive" className="max-w-lg bg-white">
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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        Cargando Aplicación...
      </div>
    );
  }

  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return 'UP'; // Default placeholder like in design
  };

  const currentPageInfo = pageTitles[pathname] || { title: 'Admin', subtitle: 'Bienvenido' };


  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r p-6 flex flex-col shrink-0">
        <Link href="/dashboard" className="flex items-center mb-10">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground mr-3 shrink-0">
            <Truck size={24} /> {/* Using Truck icon as per new design */}
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800">Sistema</div>
            <div className="text-sm text-slate-500">Gestión Integral</div>
          </div>
        </Link>

        <nav className="flex-1 overflow-y-auto">
          {navigationModules.map((section, idx) => (
            <div key={idx} className="mb-6">
              <div className="text-xs font-semibold text-slate-500 mb-3 px-3">
                {section.category}
              </div>
              {section.items.map((item) => (
                <Link
                  href={item.href}
                  key={item.id}
                  onClick={() => setActiveModuleId(item.id)}
                  className={`
                    flex items-center p-3 rounded-xl mb-1 cursor-pointer transition-colors
                    ${activeModuleId === item.id
                      ? 'bg-blue-100 text-primary font-medium'
                      : 'hover:bg-slate-100 text-slate-600'}
                  `}
                >
                  <item.icon className={`mr-3 ${activeModuleId === item.id ? 'text-primary' : 'text-slate-500'}`} size={20} />
                  <span className="flex-1">{item.label}</span>
                  {item.fields && (
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                      {item.fields}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>
         {/* User profile / logout at the bottom of sidebar */}
         <div className="mt-auto pt-6 border-t border-slate-200">
            <div className="flex items-center p-2 rounded-lg hover:bg-slate-100 cursor-pointer group">
                <Avatar className="h-10 w-10 mr-3">
                   <AvatarImage src={user?.photoURL || undefined} alt={displayName || user?.email || "User"} />
                   <AvatarFallback className="bg-blue-100 text-primary font-semibold">
                     {getInitials(displayName, user?.email)}
                   </AvatarFallback>
                 </Avatar>
                <div className="flex-1">
                    <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                        {displayName || user?.email?.split('@')[0]}
                    </div>
                    <div className="text-xs text-slate-500 group-hover:text-slate-600">
                        {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Usuario'}
                    </div>
                </div>
                <div className="relative">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronUp className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="top" className="mb-2 w-48">
                            <DropdownMenuItem asChild>
                                <Link href="/profile" className="flex items-center gap-2">
                                    <UserCog size={16}/> Perfil
                                </Link>
                            </DropdownMenuItem>
                             <DropdownMenuItem asChild>
                                <Link href="/settings/account" className="flex items-center gap-2">
                                    <SettingsIcon size={16}/> Ajustes
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <ThemeToggle /> {/* Integrate ThemeToggle directly */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout} className="text-red-600 focus:bg-red-50 focus:text-red-700 flex items-center gap-2">
                                <LogOut size={16}/> Cerrar Sesión
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto"> {/* Added overflow-y-auto */}
        {/* Topbar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{currentPageInfo.title}</h1>
            <p className="text-slate-500">{currentPageInfo.subtitle}</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative cursor-pointer group">
              <BellIcon className="text-slate-500 group-hover:text-primary transition-colors" size={24} />
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-semibold rounded-full w-4.5 h-4.5 flex items-center justify-center ring-2 ring-white">
                3
              </span>
            </div>
            {/* Removed ThemeToggle from here, now in sidebar user menu */}
            {/* User Avatar in top bar is not in the new design, it's in sidebar bottom */}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

// Radix DropdownMenu components (if not already globally available, ensure they are)
// For simplicity, assuming these are available through @/components/ui/dropdown-menu
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppLayoutContent>{children}</AppLayoutContent>;
}
