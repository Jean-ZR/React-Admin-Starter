
export interface TranslationSet {
  // Sidebar main modules & categories
  dashboard: string;
  assets: string;
  clients: string;
  inventory: string;
  services: string;
  invoicing: string;
  reports_category: string; 
  settings_category: string; 
  support: string;

  // Sub-items for Assets
  assets_list: string;
  assets_categories: string;
  assets_reports: string;

  // Sub-items for Clients
  clients_directory: string;
  clients_portal: string;
  clients_history: string;

  // Sub-items for Inventory
  inventory_stock: string;
  inventory_movements: string;
  inventory_alerts: string;
  inventory_reports: string;

  // Sub-items for Services
  services_catalog: string;
  services_scheduling: string;
  services_history: string;

  // Sub-items for Invoicing
  invoicing_list: string;
  invoicing_create: string;

  // Sub-items for Reports Category
  reports_financial: string;
  reports_operational: string;
  reports_custom: string;

  // Sub-items for Settings Category
  settings_general: string;
  settings_account: string;
  settings_users: string;
  settings_notifications: string;
  settings_logs: string;
  settings_establishments: string; 
  settings_series: string; // Nueva clave para Series de Comprobantes

  page_title_dashboard: string;
  page_subtitle_dashboard: string;
  page_title_assets_list: string;
  page_subtitle_assets_list: string;
  page_title_assets_categories: string;
  page_subtitle_assets_categories: string;
  page_title_assets_reports: string;
  page_subtitle_assets_reports: string;
  page_title_clients_directory: string;
  page_subtitle_clients_directory: string;
  page_title_clients_portal: string;
  page_subtitle_clients_portal: string;
  page_title_clients_history: string;
  page_subtitle_clients_history: string;
  page_title_inventory_stock: string;
  page_subtitle_inventory_stock: string;
  page_title_inventory_movements: string;
  page_subtitle_inventory_movements: string;
  page_title_inventory_alerts: string;
  page_subtitle_inventory_alerts: string;
  page_title_inventory_reports: string;
  page_subtitle_inventory_reports: string;
  page_title_services_catalog: string;
  page_subtitle_services_catalog: string;
  page_title_services_scheduling: string;
  page_subtitle_services_scheduling: string;
  page_title_services_history: string;
  page_subtitle_services_history: string;
  page_title_invoicing_list: string; 
  page_subtitle_invoicing_list: string; 
  page_title_invoicing_create: string; 
  page_subtitle_invoicing_create: string; 
  page_title_reports_financial: string;
  page_subtitle_reports_financial: string;
  page_title_reports_operational: string;
  page_subtitle_reports_operational: string;
  page_title_reports_custom: string;
  page_subtitle_reports_custom: string;
  page_title_settings_general: string;
  page_subtitle_settings_general: string;
  page_title_settings_account: string;
  page_subtitle_settings_account: string;
  page_title_settings_users: string;
  page_subtitle_settings_users: string;
  page_title_settings_notifications: string;
  page_subtitle_settings_notifications: string;
  page_title_settings_logs: string;
  page_subtitle_settings_logs: string;
  page_title_settings_establishments: string; 
  page_subtitle_settings_establishments: string; 
  page_title_settings_series: string; // Nueva clave para título de página de Series
  page_subtitle_settings_series: string; // Nueva clave para subtítulo de página de Series
  page_title_profile: string;
  page_subtitle_profile: string;
}

export interface Translations {
  [key: string]: TranslationSet;
}

export const translations: Translations = {
  en: {
    dashboard: 'Dashboard',
    assets: 'Assets',
    clients: 'Clients',
    inventory: 'Inventory',
    services: 'Services',
    invoicing: 'Invoicing',
    reports_category: 'Analysis',
    settings_category: 'Configuration',
    support: 'Support',

    assets_list: 'List',
    assets_categories: 'Categories',
    assets_reports: 'Asset Reports',

    clients_directory: 'Directory',
    clients_portal: 'Portal',
    clients_history: 'History',

    inventory_stock: 'Stock',
    inventory_movements: 'Movements',
    inventory_alerts: 'Alerts',
    inventory_reports: 'Inventory Reports',

    services_catalog: 'Catalog',
    services_scheduling: 'Scheduling',
    services_history: 'History',

    invoicing_list: 'Invoice List',
    invoicing_create: 'Create Invoice',

    reports_financial: 'Financial',
    reports_operational: 'Operational',
    reports_custom: 'Custom Builder',

    settings_general: 'General',
    settings_account: 'Account',
    settings_users: 'User Management',
    settings_notifications: 'Notifications',
    settings_logs: 'System Logs',
    settings_establishments: 'Establishments', 
    settings_series: 'Document Series', // EN Translation for Series

    page_title_dashboard: 'Dashboard',
    page_subtitle_dashboard: 'Management Overview',
    page_title_assets_list: 'Asset List',
    page_subtitle_assets_list: 'Manage your company assets',
    page_title_assets_categories: 'Asset Categories',
    page_subtitle_assets_categories: 'Organize your assets',
    page_title_assets_reports: 'Asset Reports',
    page_subtitle_assets_reports: 'Asset data analysis',
    page_title_clients_directory: 'Client Directory',
    page_subtitle_clients_directory: 'Manage your customers',
    page_title_clients_portal: 'Client Portal',
    page_subtitle_clients_portal: 'Customer interactions and services',
    page_title_clients_history: 'Client History',
    page_subtitle_clients_history: 'Transaction log',
    page_title_inventory_stock: 'Stock Management',
    page_subtitle_inventory_stock: 'Inventory tracking',
    page_title_inventory_movements: 'Stock Movements',
    page_subtitle_inventory_movements: 'Log of entries and exits',
    page_title_inventory_alerts: 'Low Stock Alerts',
    page_subtitle_inventory_alerts: 'Inventory notifications',
    page_title_inventory_reports: 'Inventory Reports',
    page_subtitle_inventory_reports: 'Stock analysis',
    page_title_services_catalog: 'Service Catalog',
    page_subtitle_services_catalog: 'Services offered',
    page_title_services_scheduling: 'Service Scheduling',
    page_subtitle_services_scheduling: 'Calendar and appointments',
    page_title_services_history: 'Service History',
    page_subtitle_services_history: 'Record of jobs',
    page_title_invoicing_list: 'Invoices', 
    page_subtitle_invoicing_list: 'Manage your customer invoices', 
    page_title_invoicing_create: 'Create New Invoice', 
    page_subtitle_invoicing_create: 'Generate a new invoice for a client', 
    page_title_reports_financial: 'Financial Reports',
    page_subtitle_reports_financial: 'Income and expense analysis',
    page_title_reports_operational: 'Operational Reports',
    page_subtitle_reports_operational: 'Performance metrics',
    page_title_reports_custom: 'Custom Reports',
    page_subtitle_reports_custom: 'Create your own reports and charts',
    page_title_settings_general: 'General Settings',
    page_subtitle_settings_general: 'System parameters',
    page_title_settings_account: 'Account Settings',
    page_subtitle_settings_account: 'Personal preferences',
    page_title_settings_users: 'User Management',
    page_subtitle_settings_users: 'Access control and roles',
    page_title_settings_notifications: 'Notification Settings',
    page_subtitle_settings_notifications: 'Alerts and notices',
    page_title_settings_logs: 'System Logs',
    page_subtitle_settings_logs: 'Activity and events',
    page_title_settings_establishments: 'Establishment Management', 
    page_subtitle_settings_establishments: 'Configure your company branches or points of sale', 
    page_title_settings_series: 'Document Series Management', // EN Translation for Series page title
    page_subtitle_settings_series: 'Configure numbering series for your documents per establishment', // EN Translation for Series page subtitle
    page_title_profile: 'User Profile',
    page_subtitle_profile: 'Manage your personal information',
  },
  es: {
    dashboard: 'Panel de Control',
    assets: 'Activos',
    clients: 'Clientes',
    inventory: 'Inventario',
    services: 'Servicios',
    invoicing: 'Facturación',
    reports_category: 'Análisis',
    settings_category: 'Configuración',
    support: 'Soporte',

    assets_list: 'Lista',
    assets_categories: 'Categorías',
    assets_reports: 'Reportes de Activos',

    clients_directory: 'Directorio',
    clients_portal: 'Portal',
    clients_history: 'Historial',

    inventory_stock: 'Stock',
    inventory_movements: 'Movimientos',
    inventory_alerts: 'Alertas',
    inventory_reports: 'Reportes de Inventario',

    services_catalog: 'Catálogo',
    services_scheduling: 'Programación',
    services_history: 'Historial',

    invoicing_list: 'Lista de Comprobantes',
    invoicing_create: 'Crear Comprobante',

    reports_financial: 'Financieros',
    reports_operational: 'Operacionales',
    reports_custom: 'Constructor Personalizado',

    settings_general: 'General',
    settings_account: 'Cuenta',
    settings_users: 'Gestión de Usuarios',
    settings_notifications: 'Notificaciones',
    settings_logs: 'Registros del Sistema',
    settings_establishments: 'Establecimientos', 
    settings_series: 'Series de Comprobantes', // ES Translation for Series

    page_title_dashboard: 'Panel de Control',
    page_subtitle_dashboard: 'Resumen de gestión',
    page_title_assets_list: 'Lista de Activos',
    page_subtitle_assets_list: 'Gestión de inventario de activos',
    page_title_assets_categories: 'Categorías de Activos',
    page_subtitle_assets_categories: 'Organiza tus activos',
    page_title_assets_reports: 'Reportes de Activos',
    page_subtitle_assets_reports: 'Análisis de datos de activos',
    page_title_clients_directory: 'Directorio de Clientes',
    page_subtitle_clients_directory: 'Administra tus clientes',
    page_title_clients_portal: 'Portal del Cliente',
    page_subtitle_clients_portal: 'Interacciones y servicios',
    page_title_clients_history: 'Historial del Cliente',
    page_subtitle_clients_history: 'Registro de transacciones',
    page_title_inventory_stock: 'Gestión de Stock',
    page_subtitle_inventory_stock: 'Seguimiento de inventario',
    page_title_inventory_movements: 'Movimientos de Stock',
    page_subtitle_inventory_movements: 'Registro de entradas y salidas',
    page_title_inventory_alerts: 'Alertas de Stock Bajo',
    page_subtitle_inventory_alerts: 'Notificaciones de inventario',
    page_title_inventory_reports: 'Reportes de Inventario',
    page_subtitle_inventory_reports: 'Análisis de stock',
    page_title_services_catalog: 'Catálogo de Servicios',
    page_subtitle_services_catalog: 'Servicios ofrecidos',
    page_title_services_scheduling: 'Programación de Servicios',
    page_subtitle_services_scheduling: 'Calendario y citas',
    page_title_services_history: 'Historial de Servicios',
    page_subtitle_services_history: 'Registro de trabajos',
    page_title_invoicing_list: 'Lista de Comprobantes', 
    page_subtitle_invoicing_list: 'Gestiona los comprobantes de tus clientes', 
    page_title_invoicing_create: 'Crear Nuevo Comprobante', 
    page_subtitle_invoicing_create: 'Genera un nuevo comprobante para un cliente', 
    page_title_reports_financial: 'Reportes Financieros',
    page_subtitle_reports_financial: 'Análisis de ingresos y gastos',
    page_title_reports_operational: 'Reportes Operacionales',
    page_subtitle_reports_operational: 'Métricas de rendimiento',
    page_title_reports_custom: 'Reportes Personalizados',
    page_subtitle_reports_custom: 'Crea tus propios reportes y gráficas',
    page_title_settings_general: 'Configuración General',
    page_subtitle_settings_general: 'Parámetros del sistema',
    page_title_settings_account: 'Configuración de Cuenta',
    page_subtitle_settings_account: 'Preferencias personales',
    page_title_settings_users: 'Gestión de Usuarios',
    page_subtitle_settings_users: 'Control de acceso y roles',
    page_title_settings_notifications: 'Configuración de Notificaciones',
    page_subtitle_settings_notifications: 'Alertas y avisos',
    page_title_settings_logs: 'Registros del Sistema',
    page_subtitle_settings_logs: 'Actividad y eventos',
    page_title_settings_establishments: 'Gestión de Establecimientos', 
    page_subtitle_settings_establishments: 'Configura las sucursales o puntos de venta de tu empresa', 
    page_title_settings_series: 'Gestión de Series de Comprobantes', // ES Translation for Series page title
    page_subtitle_settings_series: 'Configura las series de numeración para tus documentos por establecimiento', // ES Translation for Series page subtitle
    page_title_profile: 'Perfil de Usuario',
    page_subtitle_profile: 'Gestiona tu información personal',
  }
};

// Helper function to get a translation
export const getTranslation = (lang: string | null | undefined, key: keyof TranslationSet, fallbackLang: string = 'en'): string => {
  const effectiveLang = (lang && translations[lang]) ? lang : fallbackLang;
  return translations[effectiveLang]?.[key] || translations[fallbackLang]?.[key] || key.replace(/_/g, ' ');
};

// Helper to get page title object
export const getPageTitleInfo = (lang: string | null | undefined, path: string, fallbackLang: string = 'en'): { title: string; subtitle: string } => {
  const pathKey = path.replace(/\//g, '_').substring(1) || 'dashboard'; 

  const titleKey = `page_title_${pathKey}` as keyof TranslationSet;
  const subtitleKey = `page_subtitle_${pathKey}` as keyof TranslationSet;
  
  const effectiveLang = (lang && translations[lang]) ? lang : fallbackLang;

  const title = translations[effectiveLang]?.[titleKey] || translations[fallbackLang]?.[titleKey] || pathKey.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.substring(1)).join(' ');
  const subtitle = translations[effectiveLang]?.[subtitleKey] || translations[fallbackLang]?.[subtitleKey] || 'Manage this section';

  return { title, subtitle };
};

export interface NavSubItem {
  labelKey: keyof TranslationSet;
  href: string;
  id: string;
  icon?: React.ElementType; // Optional icon for sub-items
}

export interface NavModule {
  categoryKey: keyof TranslationSet;
  items: Array<{
    icon: React.ElementType;
    labelKey: keyof TranslationSet;
    id: string;
    href: string;
    subItems?: NavSubItem[];
    adminOnly?: boolean; // Optional flag for admin-only top-level items
  }>;
}

    
