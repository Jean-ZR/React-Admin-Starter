
# System Settings Documentation

The System Settings section allows administrators and users to configure various aspects of the application, manage user accounts, and view system logs.

## Pages and Functionality:

### 1. General Configuration (`/settings/general`)

*   **Purpose**: To manage system-wide parameters and default preferences. This page is typically restricted to administrators.
*   **Key Features**:
    *   **Data Persistence**: Settings are stored in a single Firestore document (e.g., `settings/generalConfiguration`).
    *   **Form-Based Editing**: Uses `react-hook-form` and `zod` for validation.
    *   **Settings Managed**:
        *   Application Name
        *   Company Name (optional)
        *   System Email Address (for notifications)
        *   Default Language
        *   Timezone
        *   Date Format
        *   Feature Flags (switches):
            *   Enable Client Portal
            *   Enable Detailed Audit Logging
            *   Enable API Access
    *   **Saving**: "Save Changes" button updates the Firestore document.
    *   **Access Control**: UI elements are disabled if the current user is not an admin. An access denied message is shown.
*   **Data Source**: `settings/generalConfiguration` document in Firestore.

### 2. User Management (`/settings/users`)

*   **Purpose**: For administrators to manage user accounts, roles, and access levels.
*   **Key Features**:
    *   **CRUD Operations (Firestore `users` collection)**:
        *   **Read**: Displays a table of all users from the `users` collection, showing Avatar, Name, Email, Role, Status, and Created At.
        *   **Update**: Administrators can edit a user's `displayName`, `role`, and `status` via the `UserFormModal`. Email is not editable from this interface for existing users.
        *   **Delete (Conceptual - Firestore Only)**: Administrators can remove a user's document from the `users` collection via `DeleteConfirmationDialog`. **Note**: This does not delete the user from Firebase Authentication. Full user deletion requires Admin SDK privileges, typically on a backend.
    *   **Invite User (Conceptual)**: An "Invite User" button opens the `UserFormModal` in invite mode. In a real app, this would trigger an invitation flow (e.g., backend function to create user or send invite email). For now, it logs the intent.
    *   **Filtering**: Filter users by `role` and `status` using dropdowns. These filters apply Firestore queries.
    *   **Search**: Client-side search by user's display name or email.
    *   **Access Control**: This page is accessible and functional only for users with the 'admin' role.
*   **Modals Used**:
    *   `UserFormModal`: For inviting new users (conceptual) and editing existing user details (role, status).
    *   `DeleteConfirmationDialog`: For confirming the removal of a user's Firestore document.
*   **Data Source**: `users` collection in Firestore.

### 3. Account Settings (`/settings/account`)

*   **Purpose**: Allows individual users to manage their personal account preferences.
*   **Key Features**:
    *   **Appearance**:
        *   **Theme Selection**: Users can choose between Light, Dark, or System theme using `next-themes`. Changes are applied instantly and persisted by `next-themes`.
    *   **Language & Region**:
        *   **Application Language**: Users can select their preferred language (e.g., English, Español). This preference is saved to their user document in Firestore (`users/{userId}.languagePreference`) via the `AuthContext`.
    *   **Notification Preferences Link**: Provides a button to navigate to the dedicated Notification Settings page.
    *   **Saving**: "Save Changes" button saves the language preference.
*   **Data Source**: User's theme preference is managed by `next-themes` (typically in `localStorage`). Language preference is read from and saved to the current user's document in the `users` collection in Firestore.

### 4. Notification Settings (`/settings/notifications`)

*   **Purpose**: Allows users to customize which notifications they receive and through which channels (e.g., email, SMS - SMS is conceptual).
*   **Key Features**:
    *   **Global Toggle**: Enable or disable all notifications.
    *   **Granular Control**: For various event types (e.g., Low Stock Alert, New Service Ticket), users can:
        *   Enable/disable the notification for that specific event type.
        *   Choose to receive it via Email (checkbox).
        *   Choose to receive it via SMS (checkbox - conceptual, no SMS sending implemented).
    *   **Saving**: "Save Preferences" button updates the `notificationPreferences` map in the current user's document in the `users` collection in Firestore, via the `AuthContext`.
*   **Data Source**: Reads from and saves to the `notificationPreferences` field in the current user's document in the `users` collection.

### 5. System Logs (`/settings/logs`)

*   **Purpose**: Provides a view for administrators (or authorized users) to inspect system activity logs.
*   **Key Features**:
    *   **Log Display**: Fetches and displays log entries from a `systemLogs` collection in Firestore, ordered by timestamp.
    *   **Log Details**: Shows Timestamp, User (email or "System"), Action, Level (Info, Warning, Error, Debug with appropriate badges), and Details.
    *   **Filtering**:
        *   Search bar for general text search within logs.
        *   Filter by User Email.
        *   Filter by Action.
        *   Filter by Log Level.
        *   Filter by Date Range using `DatePicker` components.
    *   **Data Export**: Export the displayed (filtered) logs to CSV or PDF.
    *   **No Create/Update/Delete**: Log entries are typically immutable and generated by the system, not manually managed from this UI.
*   **Data Source**: `systemLogs` collection in Firestore.

## Data Models (Firestore Collections):

*   **`settings`**:
    *   Document: `generalConfiguration`
        *   Fields: `appName` (string), `companyName` (string), `systemEmail` (string), `defaultLanguage` (string), `timezone` (string), `dateFormat` (string), `clientPortalEnabled` (boolean), `auditLoggingEnabled` (boolean), `apiAccessEnabled` (boolean), `updatedAt` (Timestamp).
*   **`users`**: (Also used by Authentication)
    *   Fields: `displayName` (string), `email` (string), `role` (string), `status` (string: "Active", "Inactive", "Pending"), `notificationPreferences` (map), `languagePreference` (string), `createdAt` (Timestamp), `updatedAt` (Timestamp), `lastLogin` (Timestamp, optional).
*   **`systemLogs`**:
    *   Fields: `timestamp` (Timestamp), `userEmail` (string, or `userId`), `action` (string), `level` (string: "Info", "Warning", "Error", "Debug"), `details` (string, optional).

## Security and Access:

*   "General Configuration" and "User Management" should be strictly limited to 'admin' roles, enforced by UI checks and, critically, Firestore Security Rules.
*   "Account Settings" and "Notification Settings" are user-specific. Users should only be able to modify their own settings.
*   "System Logs" access might also be role-restricted.
