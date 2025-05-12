# React Admin Starter - Firebase Edition

This project is a comprehensive starter template for building administration dashboards using Next.js, TypeScript, ShadCN UI, Tailwind CSS, and Firebase for backend services (Authentication and Firestore Database).

It provides a robust foundation with pre-built sections for managing Assets, Clients, Inventory, Services, Reporting, and System Settings, including authentication flows and basic CRUD functionalities.

**Live Demo:** [Link to deployed demo if available]

## Table of Contents

1.  [Features](#features)
2.  [Use Cases](#use-cases)
3.  [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Firebase Setup](#firebase-setup)
    *   [Installation](#installation)
    *   [Environment Variables](#environment-variables)
    *   [Running the Application](#running-the-application)
4.  [Project Structure](#project-structure)
5.  [Authentication and Roles](#authentication-and-roles)
6.  [Available Sections](#available-sections)
7.  [Exporting Data](#exporting-data)
8.  [Customization](#customization)
9.  [Contributing](#contributing)
10. [Contact](#contact)
11. [License](#license)

## Features

*   **Modern Tech Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS.
*   **UI Components:** Built with ShadCN UI for accessible and reusable components.
*   **Firebase Integration:**
    *   Firebase Authentication (Email/Password)
    *   Firestore Database (for user roles and potentially app data)
*   **Role-Based Access Control (RBAC):** Basic implementation with different user roles (Admin, Teacher, Student - configurable).
*   **Pre-built Modules:** Sections for managing Assets, Clients, Inventory, Services, Reporting, and Settings.
*   **CRUD Operations:** Modals implemented for adding/editing Assets and Clients (can be adapted for other sections).
*   **Authentication Flow:** Login, Signup, Forgot Password pages.
*   **Responsive Design:** Adapts to various screen sizes.
*   **Theming:** Light/Dark mode toggle.
*   **Data Export:** Basic CSV and PDF export functionality (using browser APIs and placeholders for libraries).
*   **Search & Filtering:** Placeholders and basic structure for search and filtering in tables.
*   **Toast Notifications:** For user feedback on actions.
*   **Detailed README:** Comprehensive setup and usage guide.

## Use Cases

This starter template is ideal for:

*   Internal company dashboards
*   Client management systems (CRMs)
*   Inventory and asset tracking applications
*   Service management platforms
*   Educational administration portals
*   Any application requiring a structured admin interface with user roles and data management.

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

*   **Node.js:** v18.x or later (Check with `node -v`)
*   **npm** or **yarn:** Package manager (Check with `npm -v` or `yarn -v`)
*   **Firebase Account:** A Google account to create a Firebase project.

### Firebase Setup

1.  **Create a Firebase Project:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Click "Add project" and follow the on-screen instructions.
2.  **Enable Authentication:**
    *   In your Firebase project console, navigate to "Authentication" (under Build).
    *   Click "Get started".
    *   Select the "Email/Password" sign-in method and enable it.
3.  **Enable Firestore Database:**
    *   Navigate to "Firestore Database" (under Build).
    *   Click "Create database".
    *   Choose **Start in production mode** or **Start in test mode**. For development, test mode is easier, but remember to **secure your rules before production**. ([Learn about Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)).
    *   Select a location for your database.
4.  **Register Your Web App:**
    *   Go to your Project Settings (click the gear icon near "Project Overview").
    *   Scroll down to the "Your apps" section.
    *   Click the web icon (`</>`) to add a web app.
    *   Give your app a nickname (e.g., "Admin Dashboard").
    *   **Do NOT** enable Firebase Hosting at this stage unless you plan to host directly on Firebase Hosting.
    *   Click "Register app".
5.  **Get Firebase Credentials:**
    *   After registering, Firebase will provide you with a `firebaseConfig` object. **Copy these values.** You will need them for the environment variables.

    ```javascript
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID",
      measurementId: "YOUR_MEASUREMENT_ID" // Optional
    };
    ```

### Installation

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Environment Variables

1.  **Create `.env.local` file:** Create a file named `.env.local` in the root of your project directory.
2.  **Add Firebase Credentials:** Copy the credentials you obtained from the Firebase console into the `.env.local` file. Prefix each variable name with `NEXT_PUBLIC_`.

    ```dotenv
    # .env.local

    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
    # NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID # Optional
    ```

    **Important:**
    *   Replace `YOUR_...` with your actual Firebase project credentials.
    *   The `NEXT_PUBLIC_` prefix is crucial for Next.js to expose these variables to the browser-side code.
    *   `.env.local` is included in `.gitignore` by default to prevent accidentally committing sensitive credentials. **Never commit your `.env.local` file or credentials directly into your code.**

### Running the Application

1.  **Start the Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    This command typically starts the app on `http://localhost:3000` (or the port specified in `package.json`, which is 9002 in this project).

2.  **Access the Application:** Open your browser and navigate to `http://localhost:9002`.

3.  **Sign Up/Login:**
    *   Use the Signup page to create your first user account (e.g., an Administrator).
    *   Log in using the credentials you created.

## Project Structure

```
.
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── (app)/      # Authenticated routes layout and pages
│   │   │   ├── assets/
│   │   │   ├── clients/
│   │   │   ├── dashboard/
│   │   │   ├── inventory/
│   │   │   ├── reports/
│   │   │   ├── services/
│   │   │   ├── settings/
│   │   │   └── layout.tsx # Layout for authenticated routes
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── globals.css # Global styles and Tailwind directives
│   │   ├── layout.tsx  # Root layout
│   │   └── page.tsx    # Root page (redirects to dashboard)
│   ├── components/     # Reusable UI components
│   │   ├── assets/     # Asset-specific components (e.g., forms)
│   │   ├── clients/    # Client-specific components
│   │   ├── providers/  # Context providers (Theme)
│   │   ├── ui/         # ShadCN UI components
│   │   └── ...         # Other shared components (e.g., Delete Dialog)
│   ├── contexts/       # React Contexts (e.g., AuthContext)
│   ├── hooks/          # Custom React Hooks (e.g., useToast, useMobile)
│   ├── lib/            # Utility functions and libraries
│   │   ├── firebase/   # Firebase configuration and initialization
│   │   ├── export.ts   # Data export utility functions (placeholder)
│   │   └── utils.ts    # General utility functions (e.g., cn)
│   └── ai/             # Genkit related files (optional AI features)
│       ├── dev.ts
│       └── genkit.ts
├── .env.local          # Environment variables (ignored by git)
├── .gitignore
├── components.json     # ShadCN UI configuration
├── next.config.ts      # Next.js configuration
├── package.json
├── README.md           # This file
└── tsconfig.json       # TypeScript configuration
```

## Authentication and Roles

*   **Authentication:** Handled by Firebase Authentication using email and password.
*   **User Roles:** Stored in Firestore under the `users` collection when a user signs up. The `AuthContext` fetches the user's role upon login.
*   **Role-Based Access:** The application layout (`src/app/(app)/layout.tsx`) includes an example of conditionally rendering the "User Management" link based on the user's role (`role === 'admin'`). This pattern can be extended to protect pages or features based on roles.
*   **Available Roles (Signup):** Administrator, Teacher, Student (this can be modified in `src/app/signup/page.tsx`).

## Available Sections

*   **Asset Management:** Dashboard, List, Categories, Reports.
*   **Client Management:** Directory, Portal (simulation), History.
*   **Inventory Control:** Stock Management, Movement Log, Low Stock Alerts, Reports.
*   **Service Management:** Catalog, Scheduling (basic calendar), History.
*   **Reporting System:** Financial (placeholder), Operational (placeholder), Custom Builder (UI only).
*   **System Settings:** General Config, User Management (admin only), Notifications, System Logs.

## Exporting Data

*   Basic export functionality is provided for CSV and PDF in the Client Directory.
*   These functions (`src/lib/export.ts`) currently use browser APIs and `console.log` for simulation.
*   For robust export, integrate libraries like:
    *   **CSV:** `papaparse`
    *   **PDF:** `jspdf` and `jspdf-autotable`

## Customization

*   **Styling:** Modify Tailwind CSS classes directly or update the theme variables in `src/app/globals.css`.
*   **Components:** Customize or replace ShadCN UI components found in `src/components/ui`.
*   **Firebase Rules:** Secure your Firestore database by defining appropriate security rules in the Firebase Console.
*   **Data Fetching:** Replace placeholder data in page components with actual data fetching logic (e.g., using React Query, SWR, or `useEffect` with Firestore queries).
*   **Add/Edit Modals:** Adapt the existing `AssetFormModal` and `ClientFormModal` for other sections or create new ones.
*   **Roles:** Modify the available roles in `src/app/signup/page.tsx` and update Firestore rules accordingly.
*   **Sidebar:** Add, remove, or reorder navigation items in `src/app/(app)/layout.tsx`.

## Contributing

Contributions are welcome! Please follow standard practices:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## Contact

If you have questions, issues, or suggestions, please:

*   Open an issue on the GitHub repository [Link to Issues].
*   [Add other contact methods if applicable, e.g., email, community forum].

## License

[Specify your license here, e.g., MIT License]

```
Copyright [Year] [Your Name or Organization]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

Happy Coding!
