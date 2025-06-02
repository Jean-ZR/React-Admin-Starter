# 10. Consideraciones de Seguridad

La seguridad es un aspecto crítico de cualquier aplicación, especialmente en paneles de administración que manejan datos sensibles y operaciones importantes. Esta sección describe las consideraciones de seguridad clave y las mejores prácticas para el React Admin Starter.

## Principios Fundamentales de Seguridad

*   **Mínimo Privilegio:** Los usuarios y componentes del sistema solo deben tener los permisos estrictamente necesarios para realizar sus funciones.
*   **Defensa en Profundidad:** Implementar múltiples capas de seguridad. Si una capa falla, otras deberían mitigar el riesgo.
*   **Nunca Confiar en la Entrada del Cliente:** Todas las validaciones de seguridad críticas y la lógica de autorización deben realizarse en el backend (en este caso, principalmente a través de las Reglas de Seguridad de Firebase). El frontend puede ocultar o deshabilitar UI, pero esto es solo para mejorar la experiencia del usuario, no como una medida de seguridad principal.
*   **Validación de Entradas:** Validar todos los datos que ingresan al sistema, tanto en el frontend (para UX) como en el backend/reglas de seguridad (para integridad y seguridad).

## Seguridad en Firebase

Firebase proporciona herramientas robustas para asegurar tu aplicación.

### 1. Reglas de Seguridad de Firestore

Las Reglas de Seguridad de Firestore son la principal línea de defensa para tus datos. Definen quién puede leer, escribir, actualizar y eliminar documentos en tus colecciones.

*   **Sintaxis Básica:**
    ```json
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Regla por defecto: Denegar todo acceso si no hay reglas más específicas.
        match /{document=**} {
          allow read, write: if false;
        }

        // Ejemplo: Colección de usuarios
        match /users/{userId} {
          // Un usuario puede leer su propio documento.
          allow read: if request.auth != null && request.auth.uid == userId;
          // Un usuario puede crear su propio documento (al registrarse).
          allow create: if request.auth != null && request.auth.uid == userId;
          // Un usuario puede actualizar su propio documento (campos específicos).
          allow update: if request.auth != null && request.auth.uid == userId &&
                           request.resource.data.keys().hasOnly(['displayName', 'notificationPreferences', 'languagePreference', 'updatedAt']);
          // Nadie puede eliminar documentos de usuario directamente desde el cliente.
          allow delete: if false;
        }

        // Ejemplo: Colección de activos (assets)
        match /assets/{assetId} {
          // Cualquier usuario autenticado puede leer activos.
          allow read: if request.auth != null;
          // Solo los administradores pueden crear, actualizar o eliminar activos.
          allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
          // También podrías permitir a ciertos roles actualizar campos específicos:
          // allow update: if request.auth != null && (
          //   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
          //   (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manager' && request.resource.data.keys().hasAny(['status', 'location', 'assignedTo']))
          // );
        }

        // Ejemplo: Configuración general (solo lectura para admins, escritura imposible desde cliente)
        match /settings/generalConfiguration {
            allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
            allow write: if false; // Solo actualizable por backend/funciones de confianza
        }
        
        // Ejemplo: Logs del sistema (solo lectura para admins)
        match /systemLogs/{logId} {
            allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
            allow write: if false; // Solo creable por backend/funciones de confianza
        }

        // Continúa con reglas para otras colecciones: clients, inventoryItems, inventoryMovements, serviceAppointments, services, etc.
      }
    }
    ```

*   **Puntos Clave para Reglas de Firestore:**
    *   **Comienza con `allow read, write: if false;` a nivel global** y luego abre permisos específicos para cada colección.
    *   **Usa `request.auth.uid`** para identificar al usuario autenticado.
    *   **Accede a los datos del usuario (como el rol)** usando `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role`.
    *   **Valida los datos entrantes** usando `request.resource.data` para asegurar que los campos tengan los tipos correctos, rangos válidos, o que solo se modifiquen ciertos campos.
        *   Ejemplo: `allow update: if request.resource.data.quantity >= 0;`
        *   Ejemplo: `allow create: if request.resource.data.status in ['Active', 'Inactive'];`
    *   **Prueba tus reglas** usando el Simulador de Reglas en la Consola de Firebase.

### 2. Seguridad de Firebase Authentication

*   Firebase Authentication maneja la verificación de identidad de los usuarios.
*   Habilita solo los proveedores de inicio de sesión que necesites.
*   Considera habilitar la autenticación multifactor (MFA) para mayor seguridad, especialmente para roles administrativos (aunque esto requiere una implementación más avanzada).

### 3. Seguridad de Firebase Storage (Si se Utiliza)

*   Al igual que Firestore, Storage tiene sus propias reglas de seguridad.
*   Define quién puede subir, descargar y eliminar archivos.
*   Ejemplo: Permitir a los usuarios subir imágenes de perfil a una ruta específica (`users/{userId}/profile.jpg`).
    ```json
    service firebase.storage {
      match /b/{bucket}/o {
        match /assets/{assetId}/{fileName} {
          allow read: if request.auth != null;
          allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
        }
        // Otras reglas para avatares, etc.
      }
    }
    ```

## Seguridad en el Frontend (Next.js/React)

*   **Renderizado Condicional de UI:** Oculta o deshabilita elementos de UI (botones, enlaces, campos de formulario) basados en el rol del usuario. Esto mejora la experiencia del usuario pero **no es una medida de seguridad suficiente por sí misma.** La verdadera autorización debe ocurrir en el backend (Reglas de Firestore).
*   **Manejo de Tokens:** Firebase SDK maneja la gestión de tokens de autenticación (ID tokens) automáticamente.
*   **Prevención de XSS (Cross-Site Scripting):** React y Next.js, por defecto, escapan el contenido renderizado, lo que ayuda a prevenir XSS. Evita usar `dangerouslySetInnerHTML` a menos que sea absolutamente necesario y entiendas los riesgos.
*   **Protección CSRF (Cross-Site Request Forgery):** Para aplicaciones web tradicionales, CSRF es una preocupación. En arquitecturas SPA que usan tokens (como los ID tokens de Firebase) en headers (ej. `Authorization: Bearer <token>`) para llamadas API, el riesgo de CSRF se reduce significativamente si no se usan cookies para la autenticación de API.

## Gestión de Secretos y Variables de Entorno

*   **Credenciales de Cliente (`.env.local`):** Todas las credenciales de Firebase para el SDK del cliente (`NEXT_PUBLIC_FIREBASE_API_KEY`, etc.) deben estar en `.env.local` y este archivo **NUNCA** debe ser subido a tu repositorio Git.
*   **Claves de Servidor:** Si implementas Firebase Functions o cualquier lógica de backend que requiera claves de API con privilegios de administrador (ej. Firebase Admin SDK), estas claves deben gestionarse de forma segura en el entorno del servidor y **NUNCA** exponerse al cliente.

## Dependencias Seguras

*   Mantén tus dependencias actualizadas regularmente. Usa `npm audit` (o `yarn audit`) para identificar y solucionar vulnerabilidades conocidas en tus paquetes.
*   Considera usar herramientas como Dependabot (en GitHub) para automatizar las actualizaciones de seguridad.

## Registro de Auditoría

*   La colección `systemLogs` (si se implementa correctamente, idealmente con escrituras desde el backend o Cloud Functions) es crucial para la seguridad.
*   Permite rastrear quién hizo qué y cuándo. Esto es vital para investigar incidentes de seguridad, depurar problemas y cumplir con requisitos de auditoría.
*   Asegura que solo usuarios autorizados (generalmente administradores) puedan leer los `systemLogs` y que nadie pueda modificarlos o eliminarlos desde el cliente.

## Conclusión

La seguridad es un proceso continuo, no un estado final. Revisa y actualiza regularmente tus medidas de seguridad a medida que tu aplicación evoluciona y surgen nuevas amenazas. Las Reglas de Seguridad de Firebase son tu herramienta más poderosa para proteger los datos en esta arquitectura.
