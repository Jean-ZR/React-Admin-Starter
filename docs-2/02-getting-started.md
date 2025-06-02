
# 2. Primeros Pasos

Esta guía te ayudará a configurar tu entorno de desarrollo, clonar el repositorio, instalar las dependencias necesarias y ejecutar la aplicación React Admin Starter localmente.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

*   **Node.js:** Se recomienda la versión LTS más reciente (v18.x o v20.x en el momento de escribir esto). Puedes verificar tu versión con `node -v`.
*   **npm** o **yarn:** Gestor de paquetes de Node.js. npm viene con Node.js. Puedes verificar con `npm -v` o `yarn -v`.
*   **Git:** Para clonar el repositorio.
*   **Cuenta de Firebase:** Necesitarás una cuenta de Google para crear y configurar un proyecto en Firebase.

## 1. Clonar el Repositorio

Abre tu terminal o línea de comandos y clona el repositorio del proyecto en tu máquina local:

```bash
git clone <URL_DEL_REPOSITORIO> react-admin-starter
cd react-admin-starter
```

Reemplaza `<URL_DEL_REPOSITORIO>` con la URL real del repositorio Git.

## 2. Configuración de Firebase

Este es un paso crucial y se detalla extensamente en la sección [Configuración de Firebase](./03-firebase-setup.md). **Debes completar la configuración de Firebase antes de continuar con la instalación de dependencias y la ejecución de la aplicación**, ya que la aplicación depende de las credenciales de Firebase para funcionar correctamente.

Resumen rápido de los pasos de configuración de Firebase (consulta la guía detallada para más información):
    a. Crear un proyecto en la Consola de Firebase.
    b. Habilitar Autenticación (Email/Contraseña).
    c. Habilitar Firestore Database (en modo de prueba o producción con reglas de seguridad).
    d. Registrar tu aplicación web en el proyecto Firebase.
    e. Copiar el objeto `firebaseConfig` proporcionado.

## 3. Configurar Variables de Entorno

La aplicación utiliza variables de entorno para almacenar las credenciales de Firebase y otras configuraciones sensibles.

1.  **Crear el archivo `.env.local`:**
    En la raíz de tu proyecto clonado, crea un archivo llamado `.env.local`. Este archivo está ignorado por Git para proteger tus credenciales.

2.  **Añadir Credenciales de Firebase:**
    Copia las credenciales que obtuviste del objeto `firebaseConfig` (del paso 2.e) en tu archivo `.env.local`. Asegúrate de prefijar cada variable con `NEXT_PUBLIC_`.

    ```dotenv
    # .env.local

    NEXT_PUBLIC_FIREBASE_API_KEY=TU_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=TU_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=TU_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=TU_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=TU_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=TU_APP_ID
    # NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=TU_MEASUREMENT_ID # Opcional, pero recomendado si lo tienes

    # Ejemplo Genkit (si se usa Gemini directamente)
    # NEXT_PUBLIC_GEMINI_API_KEY=TU_GEMINI_API_KEY
    ```

    **Importante:**
    *   Reemplaza `TU_...` con tus credenciales reales.
    *   No cometas este archivo `.env.local` a tu repositorio Git.

## 4. Instalar Dependencias

Una vez que hayas configurado tus variables de entorno, instala las dependencias del proyecto:

Con npm:
```bash
npm install
```

O con yarn:
```bash
yarn install
```

Este comando leerá el archivo `package.json` y descargará todas las librerías necesarias.

## 5. Ejecutar la Aplicación en Desarrollo

Después de instalar las dependencias, puedes iniciar el servidor de desarrollo:

Con npm:
```bash
npm run dev
```

O con yarn:
```bash
yarn dev
```

Esto iniciará la aplicación (por defecto en `http://localhost:3000`, aunque este proyecto podría usar un puerto diferente como `http://localhost:9002` si está configurado en `package.json`). La terminal te mostrará la URL exacta.

Abre tu navegador y navega a la URL proporcionada. Deberías ver la página de inicio de sesión de la aplicación.

## 6. Primer Inicio de Sesión y Creación de Usuario

*   **Registro:** Utiliza la página de "Signup" (Registro) para crear tu primer usuario. Este usuario puede ser tu cuenta de administrador.
*   **Roles:** Durante el registro, podrás seleccionar un rol (ej. Administrador).
*   **Inicio de Sesión:** Una vez registrado, inicia sesión con las credenciales que acabas de crear.

¡Felicidades! Ahora tienes el React Admin Starter ejecutándose localmente.

## Próximos Pasos

*   Explora los diferentes módulos de la aplicación.
*   Revisa la sección de [Configuración de Firebase](./03-firebase-setup.md) para entender mejor la integración.
*   Consulta la [Pila Tecnológica](./04-technology-stack.md) y la [Arquitectura del Núcleo](./05-core-architecture.md) para una comprensión más profunda.
