
# Client Management Documentation

The Client Management section is dedicated to maintaining a comprehensive database of clients, tracking interactions, and providing a simulated portal for client engagement. All client data is stored and managed within Firebase Firestore.

## Pages and Functionality:

### 1. Client Directory (`/clients/directory`)

*   **Purpose**: To list, search, filter, and manage all client records.
*   **Key Features**:
    *   **CRUD Operations**:
        *   **Create**: Add new clients using the "Add Client" button, which opens the `ClientFormModal`. Data is saved to the `clients` collection in Firestore.
        *   **Read**: Displays a paginated table of clients with key information such as Name, Contact Person, Email, Phone, and Status. Fetches data in real-time from Firestore.
        *   **Update**: Edit existing client details via an "Edit" option in the actions menu for each client, opening `ClientFormModal`.
        *   **Delete**: Remove clients using a "Delete" option, with confirmation through `DeleteConfirmationDialog`. Deletes the client document from Firestore.
    *   **Filtering**:
        *   Filter clients by `status` (e.g., Active, Inactive, Prospect) using a dropdown. This triggers a Firestore query.
    *   **Search**: Client-side search by client name, email, or contact person.
    *   **Data Export**: Export the current list of clients (filtered or unfiltered) to CSV or PDF formats.
    *   **Avatars**: Displays a placeholder avatar for each client.
*   **Modals Used**:
    *   `ClientFormModal`: For creating and editing client information.
    *   `DeleteConfirmationDialog`: For confirming client deletion.
*   **Data Source**: `clients` collection in Firestore.

### 2. Client Portal (`/clients/portal`)

*   **Purpose**: Simulates a client-facing interface for service requests and information access.
*   **Key Features (Conceptual - UI Only)**:
    *   Displays a welcome message (would be dynamic per client).
    *   Action cards for common client tasks:
        *   "Submit New Request": Placeholder button.
        *   "View Open Tickets": Placeholder button.
        *   "Knowledge Base": Placeholder button.
    *   A simplified form for submitting a new service request (UI only).
*   **Data Source**: This page is primarily UI-driven for demonstration. A real client portal would involve fetching client-specific data (e.g., their tickets, services) and would require secure, scoped data access.

### 3. Client History (`/clients/history`)

*   **Purpose**: To track and display a log of all interactions and transactions related to clients.
*   **Key Features (Conceptual - Uses Mock Data)**:
    *   **Display**: Shows a table of historical events, including date, client, type of interaction (Service Request, Communication, Transaction), description, and status.
    *   **Filtering (UI Placeholders)**:
        *   Search bar for history items.
        *   Dropdowns to filter by Client and Type of interaction.
        *   Placeholder for a date range filter.
    *   **Data Export (Placeholder)**: "Export" button with a placeholder action.
*   **Data Source**: Currently uses static mock data. A production implementation would fetch from a dedicated `clientInteractions` or `auditLogs` collection in Firestore, linking back to client IDs.

## Data Models (Firestore Collections):

*   **`clients`**: Stores individual client records.
    *   Fields: `name` (string), `contact` (string), `email` (string), `phone` (string, validated for 9 digits), `address` (string, optional), `status` (string: "Active", "Inactive", "Prospect"), `dataAiHint` (string, optional), `createdAt` (Timestamp), `updatedAt` (Timestamp).
*   **(Conceptual) `clientInteractions`**: Would store records of communications, service requests, etc.
    *   Fields might include: `clientId` (string), `timestamp` (Timestamp), `type` (string), `description` (string), `status` (string), `userId` (string, for internal user who logged it).

## Role-Based Access & Audit Logging:

*   Access to client data and modification capabilities would typically be role-restricted (e.g., sales, support, admin). Firestore Security Rules would enforce this.
*   All significant changes to client records (create, update, delete) should be audit logged.
