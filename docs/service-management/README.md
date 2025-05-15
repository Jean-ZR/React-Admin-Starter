
# Service Management Documentation

The Service Management section is designed for defining offered services, scheduling service appointments, and tracking the history of services rendered. This section is currently more conceptual with UI placeholders and mock data, awaiting full Firebase integration for CRUD operations.

## Pages and Functionality:

### 1. Service Catalog (`/services/catalog`)

*   **Purpose**: To list and describe all services offered by the business.
*   **Key Features (Conceptual - Uses Mock Data)**:
    *   **Display**: Shows an accordion list of services. Each service includes:
        *   Name
        *   Category
        *   Description
        *   Price (e.g., per hour, fixed, quote-based)
        *   Service Level Agreement (SLA) (e.g., response time)
    *   **Search (Placeholder)**: An input field to search through the service catalog.
    *   **Management (Placeholders)**:
        *   "Add Service" button.
        *   "Manage Categories" button.
        *   "Edit Service" option within each accordion item.
*   **Data Source**: Currently uses static mock data. A production version would fetch from a `services` collection and potentially a `serviceCategories` collection in Firestore.

### 2. Service Scheduling (`/services/scheduling`)

*   **Purpose**: To provide a calendar-based view for managing and scheduling service appointments.
*   **Key Features (Conceptual - Uses Mock Data & Basic Calendar)**:
    *   **Calendar View**: Uses `shadcn/ui`'s `Calendar` component for date selection. **Note**: This is a date picker, not a full-fledged event calendar. A component like FullCalendar would be needed for a rich scheduling view.
    *   **Event Display**: For a selected date, it lists mock scheduled events, showing:
        *   Service Name
        *   Client
        *   Time and Technician
        *   Status (e.g., Scheduled, Completed)
    *   **"Schedule Service" Button (Placeholder)**: To open a modal or form for creating new service appointments.
*   **Data Source**: Currently uses static mock data. A production version would fetch from a `serviceAppointments` collection in Firestore.

### 3. Service History (`/services/history`)

*   **Purpose**: To track and display a historical log of all service requests and their resolutions.
*   **Key Features (Conceptual - Uses Mock Data)**:
    *   **Display**: Shows a table of past service records, including:
        *   Ticket ID
        *   Client
        *   Service Description
        *   Assigned Technician
        *   Date Opened
        *   Date Closed
        *   Status (e.g., Closed, In Progress)
    *   **Filtering (Placeholders)**:
        *   Search bar for history items.
        *   Dropdown to filter by status.
    *   **Data Export (Placeholder)**: "Export" button.
*   **Data Source**: Currently uses static mock data. A production version would fetch from a `serviceTickets` or `serviceHistory` collection in Firestore.

## (Conceptual) Data Models (Firestore Collections):

*   **`services`**: Stores definitions of each service offered.
    *   Fields: `name` (string), `category` (string), `description` (string), `pricingModel` (string: "hourly", "fixed", "quote"), `price` (number or string), `sla` (string), `isActive` (boolean).
*   **`serviceCategories`**: Stores categories for services.
    *   Fields: `name` (string), `description` (string).
*   **`serviceAppointments`**: Stores scheduled service events.
    *   Fields: `serviceId` (string), `clientId` (string), `technicianId` (string), `scheduledDateTime` (Timestamp), `estimatedDuration` (number, in minutes/hours), `status` (string: "Scheduled", "Confirmed", "In Progress", "Completed", "Cancelled"), `notes` (string).
*   **`serviceTickets`** (or **`serviceHistory`**): Stores records of individual service requests/jobs.
    *   Fields: `clientId` (string), `serviceId` (string, optional if ad-hoc), `description` (string), `status` (string: "Open", "In Progress", "On Hold", "Resolved", "Closed"), `priority` (string), `openedAt` (Timestamp), `closedAt` (Timestamp, optional), `assignedTechnicianId` (string, optional), `resolutionDetails` (string, optional).

## Future Development:

*   Implement full Firebase CRUD operations for all pages in this section.
*   Integrate a full-featured calendar component for `ServiceSchedulingPage`.
*   Develop forms/modals for creating/editing services, appointments, and tickets.
*   Implement robust filtering, sorting, and search capabilities using Firestore queries.
*   Secure data access with Firestore Security Rules based on user roles (e.g., clients viewing their appointments, technicians viewing their schedule, admins managing the catalog).
*   Implement notification flows for appointment reminders, status updates, etc.
