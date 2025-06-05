
'use client';

import type { ReactNode } from 'react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Truck,
  Users,
  Package,
  Wrench,
  BarChart3,
  Settings,
  HelpCircle,
  Bell as BellIcon,
  Home,
  UserCog,
  LogOut,
  AlertTriangle,
  ChevronUp,
  FileText as FileTextIcon,
  Store, // Importado para Establecimientos
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
import { getTranslation, getPageTitleInfo, type TranslationSet, type NavModule, type NavSubItem } from '@/lib/translations';


const getNavigationModules = (lang: string | null | undefined): NavModule[] => [
  {
    categoryKey: "dashboard",
    items: [
        { icon: Home, labelKey: 'dashboard', id: 'dashboard', href: '/dashboard' },
    ]
  },
  {
    categoryKey: 'assets', 
    items: [
      {
        icon: Truck, labelKey: 'assets', id: 'assets', href: '/assets/list',
        subItems: [
          { labelKey: 'assets_list', href: '/assets/list', id: 'assets-list'},
          { labelKey: 'assets_categories', href: '/assets/categories', id: 'assets-categories'},
          { labelKey: 'assets_reports', href: '/assets/reports', id: 'assets-reports'},
        ]
      },
      {
        icon: Users, labelKey: 'clients', id: 'clients', href: '/clients/directory',
        subItems: [
          { labelKey: 'clients_directory', href: '/clients/directory', id: 'clients-directory'},
          { labelKey: 'clients_portal', href: '/clients/portal', id: 'clients-portal'},
          { labelKey: 'clients_history', href: '/clients/history', id: 'clients-history'},
        ]
      },
      {
        icon: Package, labelKey: 'inventory', id: 'inventory', href: '/inventory/stock',
        subItems: [
            { labelKey: 'inventory_stock', href: '/inventory/stock', id: 'inventory-stock'},
            { labelKey: 'inventory_movements', href: '/inventory/movements', id: 'inventory-movements'},
            { labelKey: 'inventory_alerts', href: '/inventory/alerts', id: 'inventory-alerts'},
            { labelKey: 'inventory_reports', href: '/inventory/reports', id: 'inventory-reports'},
        ]
      },
      {
        icon: Wrench, labelKey: 'services', id: 'services', href: '/services/catalog',
        subItems: [
          { labelKey: 'services_catalog', href: '/services/catalog', id: 'services-catalog'},
          { labelKey: 'services_scheduling', href: '/services/scheduling', id: 'services-scheduling'},
          { labelKey: 'services_history', href: '/services/history', id: 'services-history'},
        ]
      },
      { 
        icon: FileTextIcon, labelKey: 'invoicing', id: 'invoicing', href: '/invoicing/list',
        subItems: [
          { labelKey: 'invoicing_list', href: '/invoicing/list', id: 'invoicing-list'},
          { labelKey: 'invoicing_create', href: '/invoicing/create', id: 'invoicing-create'},
        ]
      },
    ],
  },
  {
    categoryKey: 'reports_category',
    items: [
      {
        icon: BarChart3, labelKey: 'reports_category', id: 'analysis_reports', href: '/reports/financial',
        subItems: [
          { labelKey: 'reports_financial', href: '/reports/financial', id: 'reports-financial' },
          { labelKey: 'reports_operational', href: '/reports/operational', id: 'reports-operational' },
          { labelKey: 'reports_custom', href: '/reports/custom', id: 'reports-custom' },
        ]
      },
    ],
  },
  {
    categoryKey: 'settings_category',
    items: [
      {
        icon: Settings, labelKey: 'settings_category', id: 'settings', href: '/settings/general',
        subItems: [
            { labelKey: 'settings_general', href: '/settings/general', id: 'settings-general' },
            { labelKey: 'settings_account', href: '/settings/account', id: 'settings-account' },
            { labelKey: 'settings_users', href: '/settings/users', id: 'settings-users' },
            { labelKey: 'settings_notifications', href: '/settings/notifications', id: 'settings-notifications' },
            { labelKey: 'settings_establishments', href: '/settings/establishments', id: 'settings-establishments', icon: Store },
            { labelKey: 'settings_logs', href: '/settings/logs', id: 'settings-logs' },
        ]
      },
      { icon: HelpCircle, labelKey: 'support', id: 'support', href: '/dashboard' }, 
    ],
  },
];


function AppLayoutContent({ children }: { children: ReactNode }) {
  const { user, loading, logout, role, displayName, isFirebaseConfigured, languagePreference } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navigationModules = useMemo(() => getNavigationModules(languagePreference), [languagePreference]);

  const [activeSubItemId, setActiveSubItemId] = useState<string | null>(null);
  const [activeAccordionValue, setActiveAccordionValue] = useState<string | undefined>(undefined);
  

  useEffect(() => {
    let newActiveSubId: string | null = null;
    let newActiveAccordionId: string | undefined = undefined;
    let itemFound = false;

    for (const modGroup of navigationModules) {
        if (itemFound) break;
        for (const item of modGroup.items) {
            if (item.subItems && item.subItems.length > 0) { 
                const matchingSubItem = item.subItems.find(sub => pathname === sub.href || pathname.startsWith(sub.href + "/"));
                if (matchingSubItem) {
                    newActiveSubId = matchingSubItem.id;
                    newActiveAccordionId = item.id; 
                    itemFound = true;
                    break;
                } else if (pathname === item.href || pathname.startsWith(item.href + "/")) {
                    newActiveSubId = item.subItems[0].id; 
                    newActiveAccordionId = item.id;
                    itemFound = true;
                    break;
                }
            } else { 
                if (pathname === item.href || pathname.startsWith(item.href + "/")) {
                    newActiveSubId = item.id;
                    newActiveAccordionId = undefined; 
                    itemFound = true;
                    break;
                }
            }
        }
    }
    
    if (!itemFound && (pathname === '/dashboard' || pathname === '/')) {
        newActiveSubId = 'dashboard';
        newActiveAccordionId = undefined;
        itemFound = true; 
    }

    setActiveSubItemId(newActiveSubId);
    
    if (itemFound && newActiveAccordionId !== undefined && newActiveAccordionId !== activeAccordionValue) {
        setActiveAccordionValue(newActiveAccordionId);
    } else if (!itemFound && activeAccordionValue !== undefined) {
        setActiveAccordionValue(undefined); 
    }
    
  }, [pathname, navigationModules, activeAccordionValue]);


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

  const currentPageInfo = getPageTitleInfo(languagePreference, pathname);

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
              <div key={section.categoryKey + idx} className="mb-2">
                <div className="text-xs font-semibold text-muted-foreground mb-2 px-3 uppercase tracking-wider">
                  {getTranslation(languagePreference, section.categoryKey)}
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
                          <span className="flex-1">{getTranslation(languagePreference, item.labelKey)}</span>
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
                             onClick={() => {
                                setActiveSubItemId(subItem.id);
                                // Ensure parent accordion stays open if already open, or opens if not.
                                // The Accordion's onValueChange also handles clicks on triggers.
                                if (activeAccordionValue !== item.id) {
                                   // setActiveAccordionValue(item.id); // Let useEffect handle based on pathname
                                }
                            }}
                          >
                            {subItem.icon && <subItem.icon className="mr-2 h-4 w-4 text-muted-foreground" />} {/* Icon for sub-item */}
                            {getTranslation(languagePreference, subItem.labelKey)}
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
                        setActiveAccordionValue(undefined); 
                        setActiveSubItemId(item.id);
                      }}
                    >
                      <item.icon className={`mr-3 ${activeSubItemId === item.id ? 'text-sidebar-accent-foreground' : 'text-muted-foreground group-hover:text-sidebar-foreground'}`} size={20} />
                      <span className="flex-1">{getTranslation(languagePreference, item.labelKey)}</span>
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
                       <AvatarImage src={user?.photoURL || undefined} alt={displayName || user?.email || "User"} data-ai-hint="person avatar" />
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

    

    