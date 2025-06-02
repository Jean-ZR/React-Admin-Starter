
# 5. Arquitectura del Núcleo

Comprender la arquitectura del React Admin Starter es fundamental para personalizarlo y extenderlo eficazmente. Esta sección describe la estructura de directorios principal, el flujo de datos y los componentes clave de la aplicación.

## Estructura de Directorios Principal

El proyecto sigue una estructura basada en las convenciones de Next.js App Router, con algunas adiciones para organizar mejor el código.

```plaintext
.
├── public/                     # Activos estáticos (imágenes, fuentes si no se sirven de otra manera)
├── src/
│   ├── app/                    # Directorio principal del App Router de Next.js
│   │   ├── (app)/              # Grupo de rutas para páginas autenticadas
│   │   │   ├── assets/         # Módulo de Gestión de Activos
│   │   │   ├── clients/        # Módulo de Gestión de Clientes
│   │   │   ├── dashboard/      # Página principal del panel
│   │   │   ├── inventory/      # Módulo de Control de Inventario
│   │   │   ├── profile/        # Página de perfil de usuario
│   │   │   ├── reports/        # Módulo del Sistema de Informes
│   │   │   ├── services/       # Módulo de Gestión de Servicios
│   │   │   └── settings/       # Módulo de Configuración del Sistema
│   │   │   └── layout.tsx      # Layout para todas las rutas autenticadas (sidebar, header)
│   │   ├── forgot-password/    # Página de recuperación de contraseña
│   │   ├── login/              # Página de inicio de sesión
│   │   ├── signup/             # Página de registro
│   │   ├── globals.css         # Estilos globales y directivas de Tailwind
│   │   ├── layout.tsx          # Layout raíz de la aplicación (proveedores de tema y auth)
│   │   └── page.tsx            # Página raíz (generalmente redirige a login o dashboard)
│   ├── components/             # Componentes de UI reutilizables
│   │   ├── assets/             # Componentes específicos del módulo de Activos (ej. formularios)
│   │   ├── clients/            # Componentes específicos del módulo de Clientes
│   │   ├── inventory/          # Componentes específicos del módulo de Inventario
│   │   ├── providers/          # Proveedores de Contexto (ej. ThemeProvider)
│   │   ├── services/           # Componentes específicos del módulo de Servicios
│   │   ├── settings/           # Componentes específicos del módulo de Configuración
│   │   ├── ui/                 # Componentes ShadCN UI (botones, inputs, etc.)
│   │   └── DeleteConfirmationDialog.tsx # Ejemplo de componente compartido
│   ├── contexts/               # Definiciones de React Context
│   │   └── auth-context.tsx    # Contexto para la gestión de autenticación y estado del usuario
│   ├── hooks/                  # Hooks personalizados de React
│   │   ├── use-toast.ts        # Hook para mostrar notificaciones (toasts)
│   │   └── use-mobile.ts       # Hook para detectar si es un dispositivo móvil
│   ├── lib/                    # Funciones de utilidad y bibliotecas
│   │   ├── firebase/           # Configuración e inicialización de Firebase
│   │   │   └── config.ts
│   │   ├── export.ts           # Utilidades para exportar datos (CSV, PDF)
│   │   ├── translations.ts     # Definiciones de cadenas de texto para i18n
│   │   └── utils.ts            # Funciones de utilidad generales (ej. `cn` para clases)
│   └── ai/                     # Archivos relacionados con Genkit (funcionalidad de IA)
│       ├── dev.ts              # Punto de entrada para el desarrollo local de Genkit
│       └── genkit.ts           # Configuración e inicialización de Genkit
├── .env.local                  # Variables de entorno (credenciales, claves API - ¡NO SUBIR A GIT!)
├── next.config.ts              # Configuración de Next.js
├── package.json                # Dependencias y scripts del proyecto
├── tsconfig.json               # Configuración de TypeScript
└── README.md                   # README principal del proyecto
```

## Flujo de Datos y Componentes Clave

### 1. Next.js App Router (`src/app`)
*   El **App Router** es responsable de definir las rutas de la aplicación. Cada carpeta dentro de `src/app` (o grupos como `(app)`) corresponde a un segmento de la URL.
*   `page.tsx` dentro de una carpeta define la UI para esa ruta.
*   `layout.tsx` define una UI compartida para un segmento y sus hijos.
    *   `src/app/layout.tsx` (Root Layout): Es el layout principal, envuelve toda la aplicación. Aquí se configuran proveedores globales como `ThemeProvider` y `AuthProvider`.
    *   `src/app/(app)/layout.tsx` (App Layout): Es el layout para las secciones autenticadas de la aplicación. Contiene el sidebar, el header y la estructura principal del panel.

### 2. Autenticación (`src/contexts/auth-context.tsx`)
*   El `AuthContext` gestiona el estado del usuario (si está logueado, su rol, preferencias).
*   Proporciona funciones para `login`, `signup`, `logout`, `resetPassword`, etc.
*   Interactúa con Firebase Authentication para las operaciones de usuario y con Firestore para leer/escribir datos del perfil del usuario (como rol y preferencias).
*   Las páginas de `login`, `signup` y `forgot-password` utilizan este contexto. El `AppLayout` también lo usa para proteger rutas y mostrar información del usuario.

### 3. Componentes de UI (`src/components`)
*   **ShadCN UI (`src/components/ui`):** Son la base de los elementos visuales. Estos componentes son altamente personalizables a través de Tailwind CSS.
*   **Componentes Específicos de Módulo (ej. `src/components/assets`):** Contienen componentes más complejos construidos a partir de los componentes de ShadCN UI, diseñados para tareas específicas de un módulo (ej., `AssetFormModal`, `ClientTable`).
*   **Proveedores (`src/components/providers`):** Componentes que envuelven partes de la aplicación para proveer contexto (ej., `ThemeProvider`).

### 4. Lógica de Negocio y Estado de Página
*   Las páginas (`page.tsx`) dentro de cada módulo (ej. `/assets/list/page.tsx`) contienen la lógica principal para esa vista:
    *   Gestión del estado local (usando `useState`).
    *   Efectos secundarios para la carga de datos (usando `useEffect` con `onSnapshot` de Firestore).
    *   Manejo de eventos (clics de botón, envíos de formulario).
    *   Renderizado de la tabla de datos, modales y otros elementos de UI.
*   **Formularios:** Se utiliza `react-hook-form` para la gestión de formularios y `zod` para la validación de esquemas, promoviendo formularios robustos y con buena experiencia de usuario.

### 5. Firebase (`src/lib/firebase/config.ts`)
*   Este archivo centraliza la inicialización de Firebase.
*   Exporta instancias de `auth` y `db` (Firestore) que son utilizadas en toda la aplicación para interactuar con los servicios de Firebase.
*   También incluye una verificación de la configuración de Firebase para asegurar que las variables de entorno estén presentes.

### 6. Utilidades (`src/lib`)
*   **`utils.ts`:** Contiene funciones de ayuda como `cn` (para combinar clases de Tailwind).
*   **`export.ts`:** Funciones para exportar datos a formatos como CSV y PDF.
*   **`translations.ts`:** Contiene las cadenas de texto para la internacionalización.

### 7. Inteligencia Artificial (`src/ai`)
*   **`genkit.ts`:** Configura e inicializa Genkit, especificando plugins (como Google AI) y modelos por defecto.
*   **Flujos (Archivos en `src/ai/flows/` - si existen):** Implementan lógica específica de IA, como prompts para LLMs, uso de herramientas, etc. Estos flujos son típicamente Server Actions o funciones que pueden ser llamadas desde el frontend.

## Flujo de Autenticación Típico

1.  Usuario navega a `/login`.
2.  Ingresa credenciales y envía el formulario.
3.  `LoginPage` llama a la función `login` del `AuthContext`.
4.  `AuthContext` usa `signInWithEmailAndPassword` de Firebase Auth.
5.  Si tiene éxito, Firebase Auth actualiza el estado del usuario.
6.  `onAuthStateChanged` en `AuthContext` detecta el cambio, actualiza el estado del contexto (usuario, rol, etc.) y redirige al `/dashboard` (o la última página visitada).
7.  `AppLayout` ahora tiene acceso al usuario autenticado y muestra el panel.

## Flujo de Carga de Datos Típico (ej. Lista de Activos)

1.  Usuario navega a `/assets/list`.
2.  `AssetListPage` (`/assets/list/page.tsx`) se monta.
3.  Un `useEffect` en `AssetListPage` ejecuta una consulta a Firestore (usando `onSnapshot` para datos en tiempo real) para obtener la colección `assets`.
4.  Los datos recibidos se almacenan en el estado local de la página usando `useState`.
5.  La tabla se renderiza con los datos del estado.
6.  Si los datos cambian en Firestore, `onSnapshot` se dispara de nuevo, actualizando el estado y la UI.

Esta arquitectura modular y basada en componentes, combinada con el poder de Next.js y Firebase, permite un desarrollo flexible y eficiente.
