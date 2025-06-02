
# 3. Configuración de Firebase

Firebase es el corazón del backend para esta aplicación, proporcionando servicios de autenticación, base de datos y, potencialmente, más. Esta guía te llevará paso a paso a través de la configuración de un proyecto de Firebase y su integración con el React Admin Starter.

## Paso 1: Crear un Proyecto en Firebase

1.  **Ve a la Consola de Firebase:** Abre tu navegador y navega a [https://console.firebase.google.com/](https://console.firebase.google.com/).
2.  **Inicia Sesión:** Si aún no lo has hecho, inicia sesión con tu cuenta de Google.
3.  **Añadir Proyecto:**
    *   Haz clic en "**Añadir proyecto**" (o "Crear un proyecto").
    *   **Nombre del Proyecto:** Ingresa un nombre para tu proyecto (ej., "Mi Admin App" o "ReactStarterFirebase"). Firebase generará un ID de proyecto único basado en este nombre.
    *   **Google Analytics (Opcional pero Recomendado):**
        *   Puedes optar por habilitar Google Analytics para tu proyecto. Esto es útil para rastrear el uso de la aplicación. Si lo habilitas, se te pedirá que selecciones una cuenta de Analytics o crees una nueva.
        *   Si no estás seguro, puedes habilitarlo; no afectará la funcionalidad principal de la plantilla si decides no usar Analytics activamente.
    *   Haz clic en "**Crear proyecto**" (o "Continuar"). Firebase tardará unos momentos en aprovisionar tu proyecto.

## Paso 2: Habilitar Autenticación Firebase

Una vez que tu proyecto esté creado, serás redirigido al panel del proyecto.

1.  **Navega a Autenticación:** En el menú de la izquierda, bajo la sección "Compilación" (o "Build"), haz clic en "**Authentication**".
2.  **Comenzar:** Haz clic en el botón "**Comenzar**".
3.  **Seleccionar Proveedor de Inicio de Sesión:**
    *   Verás una lista de proveedores de inicio de sesión. Para esta plantilla, el proveedor principal es "**Correo electrónico/Contraseña**". Haz clic en él.
    *   **Habilitar:** Activa el interruptor para "Correo electrónico/Contraseña".
    *   **NO HABILITES** "Vínculos de correo electrónico (inicio de sesión sin contraseña)" a menos que planees implementar específicamente esa funcionalidad. La plantilla está configurada para email/contraseña estándar.
    *   Haz clic en "**Guardar**".

Ahora tienes la Autenticación Firebase configurada para manejar usuarios con email y contraseña.

## Paso 3: Habilitar Firestore Database

Firestore será tu base de datos NoSQL para almacenar datos de la aplicación, como información de usuarios (roles, preferencias), datos de módulos (activos, clientes, etc.) y más.

1.  **Navega a Firestore Database:** En el menú de la izquierda (bajo "Compilación" o "Build"), haz clic en "**Firestore Database**".
2.  **Crear Base de Datos:** Haz clic en el botón "**Crear base de datos**".
3.  **Modo de Seguridad:** Se te presentarán dos opciones para las reglas de seguridad:
    *   **Iniciar en modo de producción:** Esto es más seguro. Las lecturas y escrituras a tu base de datos estarán denegadas por defecto. Necesitarás configurar [Reglas de Seguridad de Firestore](https://firebase.google.com/docs/firestore/security/get-started) para permitir el acceso adecuado. **Esta es la opción recomendada para cualquier aplicación real.**
    *   **Iniciar en modo de prueba:** Esto permite todas las lecturas y escrituras a tu base de datos durante los próximos 30 días. Es más fácil para el desarrollo inicial, pero **es crucial que asegures tus reglas antes de pasar a producción.**
    *   **Para esta plantilla, puedes comenzar en modo de prueba si estás aprendiendo, pero recuerda actualizar las reglas.** Unas reglas de ejemplo para comenzar podrían ser:
        ```json
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Permite leer y escribir a usuarios autenticados
            match /{document=**} {
              allow read, write: if request.auth != null;
            }
            // Ajusta esto según tus necesidades específicas.
            // Por ejemplo, para la colección 'users':
            match /users/{userId} {
              allow read: if request.auth != null;
              allow write: if request.auth.uid == userId; // Usuario solo puede escribir su propio documento
            }
          }
        }
        ```
4.  **Ubicación de Firestore:** Selecciona una ubicación para tu servidor de Firestore. Elige la región más cercana a tus usuarios para una menor latencia. **Una vez configurada, no podrás cambiar la ubicación.**
5.  **Haz clic en "Habilitar"** (o "Finalizar").

Tu base de datos Firestore ahora está lista.

## Paso 4: Registrar tu Aplicación Web

Debes registrar tu aplicación web con tu proyecto Firebase para obtener las credenciales de configuración.

1.  **Ve a Configuración del Proyecto:** En el panel de Firebase, haz clic en el ícono de engranaje (⚙️) junto a "Project Overview" (o "Descripción general del proyecto") en la parte superior del menú de la izquierda, y luego selecciona "**Configuración del proyecto**".
2.  **Añadir Aplicación:** En la pestaña "General", desplázate hacia abajo hasta la sección "Tus apps" (o "Your apps").
    *   Haz clic en el ícono web (`</>`) para añadir una aplicación web.
3.  **Apodo de la App:** Dale un apodo a tu aplicación (ej., "Admin Dashboard Web").
4.  **Firebase Hosting (Opcional):** **NO** marques la casilla "Configurar también Firebase Hosting para esta app" en este momento, a menos que planees específicamente desplegar en Firebase Hosting y ya estés familiarizado con ello. Puedes configurarlo más tarde si es necesario.
5.  **Haz clic en "Registrar app".**

## Paso 5: Obtener y Configurar las Credenciales de Firebase

Después de registrar tu aplicación, Firebase te proporcionará un objeto de configuración (`firebaseConfig`). **¡Este es el paso más importante para conectar tu app!**

1.  **Copia el Objeto `firebaseConfig`:**
    Verás un fragmento de código similar a este:

    ```javascript
    const firebaseConfig = {
      apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXX",
      authDomain: "tu-proyecto-id.firebaseapp.com",
      projectId: "tu-proyecto-id",
      storageBucket: "tu-proyecto-id.appspot.com",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:XXXXXXXXXXXXXXXXXXXXXX",
      measurementId: "G-XXXXXXXXXX" // Opcional, si habilitaste Analytics
    };
    ```
    **Copia estos valores cuidadosamente.**

2.  **Crea y Edita `.env.local`:**
    *   En la raíz de tu proyecto React Admin Starter, crea un archivo llamado `.env.local` (si aún no existe).
    *   Abre `.env.local` y pega tus credenciales, asegurándote de prefijar cada clave con `NEXT_PUBLIC_`:

    ```dotenv
    # .env.local

    NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXX
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto-id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
    NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:XXXXXXXXXXXXXXXXXXXXXX
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX # Incluye si tienes uno
    ```

    **¡Extremadamente Importante!**
    *   Reemplaza los valores de ejemplo con **tus valores reales** del objeto `firebaseConfig`.
    *   El prefijo `NEXT_PUBLIC_` es crucial para que Next.js exponga estas variables al código del lado del cliente.
    *   El archivo `.env.local` está (y debería estar) en tu `.gitignore`. **Nunca subas tus credenciales directamente a tu repositorio Git.**

3.  **Reinicia tu Servidor de Desarrollo:** Si tu servidor de desarrollo Next.js (`npm run dev` o `yarn dev`) estaba ejecutándose, **detenlo (Ctrl+C o Cmd+C) y reinícialo** para que cargue las nuevas variables de entorno.

## Paso 6: Índices de Firestore (Firestore Indexes)

Firestore utiliza índices para permitir consultas eficientes. Para consultas simples (ej., obtener un documento por ID, o filtrar por un solo campo), Firestore crea automáticamente los índices necesarios. Sin embargo, para consultas más complejas, es posible que necesites crear índices compuestos manualmente o a través de la consola de Firebase.

**¿Cuándo necesitas índices compuestos?**

*   **Consultas con múltiples cláusulas `where()`:** Si filtras por más de un campo (ej., `where('status', '==', 'Active').where('category', '==', 'Electronics')`).
*   **Consultas con ordenamiento (`orderBy()`) en un campo diferente al de la igualdad en `where()`:** (ej., `where('status', '==', 'Active').orderBy('purchaseDate')`).
*   **Consultas con cláusulas de rango (`<`, `<=`, `>`, `>=`) y ordenamiento en campos diferentes.**
*   **Consultas con `array-contains-any` y `in` junto con otros filtros u ordenamientos.**

**¿Cómo se crean los índices?**

1.  **Automáticamente (Enlace de la Consola):**
    *   Cuando ejecutas una consulta en tu aplicación que requiere un índice compuesto que no existe, Firestore **fallará la consulta en el lado del cliente o servidor** y, muy útilmente, **proporcionará un mensaje de error en la consola de tu navegador (o en los logs de tu servidor si la consulta es del lado del servidor) que incluye un enlace directo para crear el índice faltante en la Consola de Firebase.**
    *   Haz clic en ese enlace. Te llevará a la sección "Índices" de Firestore en la Consola de Firebase con los campos ya pre-llenados. Simplemente revisa y haz clic en "Crear índice".
    *   La creación del índice puede tardar unos minutos. Una vez que el estado cambie a "Habilitado", tu consulta debería funcionar.
    *   Este es el método más común y fácil para desarrolladores.

2.  **Manualmente en la Consola de Firebase:**
    *   Ve a tu proyecto en la Consola de Firebase.
    *   Navega a "Firestore Database" -> pestaña "Índices".
    *   Haz clic en "Añadir índice".
    *   Especifica la colección, los campos a indexar y el tipo de índice para cada campo (ascendente, descendente, contiene array).
    *   Este método es útil si estás planificando tus consultas por adelantado.

3.  **Definición de Índices en `firestore.indexes.json` (Firebase CLI):**
    *   Para un control más programático y para incluir la configuración de índices en tu control de versiones, puedes usar Firebase CLI.
    *   Primero, asegúrate de tener Firebase CLI instalado y configurado (`firebase login`, `firebase init firestore`).
    *   Puedes definir tus índices en un archivo `firestore.indexes.json` en la raíz de tu proyecto (o en un subdirectorio especificado en `firebase.json`).
    *   Un ejemplo de `firestore.indexes.json`:
        ```json
        {
          "indexes": [
            {
              "collectionGroup": "assets",
              "queryScope": "COLLECTION",
              "fields": [
                { "fieldPath": "status", "order": "ASCENDING" },
                { "fieldPath": "purchaseDate", "order": "DESCENDING" }
              ]
            },
            {
              "collectionGroup": "users",
              "queryScope": "COLLECTION",
              "fields": [
                { "fieldPath": "role", "order": "ASCENDING" },
                { "fieldPath": "displayName", "order": "ASCENDING" }
              ]
            }
            // ... más índices
          ]
        }
        ```
    *   Luego, puedes desplegar estos índices usando el comando:
        ```bash
        firebase deploy --only firestore:indexes
        ```
    *   Este método es excelente para mantener la coherencia de los índices en diferentes entornos de Firebase (desarrollo, staging, producción).

**Importante sobre los Índices:**
*   La creación de demasiados índices innecesarios puede aumentar ligeramente los costos de almacenamiento en Firestore, aunque el impacto suele ser mínimo para la mayoría de las aplicaciones.
*   Firestore tiene límites en el número de campos en un índice compuesto y el número total de índices.
*   **Sigue siempre los mensajes de error de Firestore en la consola de tu navegador; son tu mejor guía para crear los índices necesarios.**

¡Con esto, tu proyecto Firebase debería estar completamente configurado e integrado con el React Admin Starter! Puedes proceder a instalar las dependencias y ejecutar la aplicación como se describe en la sección [Primeros Pasos](./02-getting-started.md).
