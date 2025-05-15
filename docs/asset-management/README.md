
# Asset Management Documentation

The Asset Management section is designed to track and manage all company assets throughout their lifecycle. This includes acquisition, assignment, maintenance, and disposal. Data is persisted in Firebase Firestore.

## Pages and Functionality:

### 1. Dashboard (`/dashboard` - Partially related)

*   **Purpose**: Provides a high-level overview of key asset-related metrics.
*   **Key Features**:
    *   Displays "Total Assets" count fetched from the `assets` collection in Firestore.
    *   Includes an "Asset Status Distribution" pie chart showing the breakdown of assets by their status (e.g., Active, In Repair), derived from the `assets` collection.
*   **Data Source**: `assets` collection in Firestore.

### 2. Asset List (`/assets/list`)

*   **Purpose**: Provides a comprehensive, filterable, and searchable list of all assets.
*   **Key Features**:
    *   **CRUD Operations**:
        *   **Create**: Add new assets via the "Add Asset" button, which opens the `AssetFormModal`. Data is saved to the `assets` collection.
        *   **Read**: Displays a table of assets with details like Asset ID, Name, Category, Status, Location, Assigned To, Purchase Date, and an image. Data is fetched in real-time from Firestore.
        *   **Update**: Edit existing assets through an "Edit" option in the actions menu for each asset, opening the `AssetFormModal`. Changes are saved to Firestore.
        *   **Delete**: Remove assets using a "Delete" option, which prompts for confirmation via `DeleteConfirmationDialog`. Deletes the asset document from Firestore.
    *   **Filtering**:
        *   Filter by asset `status` (Active, Inactive, In Repair, etc.) using a dropdown. This applies a Firestore query.
    *   **Search**: Client-side search by asset name, serial number, assigned user, or ID.
    *   **Data Export**: Export the current list of assets to CSV or PDF.
    *   **Image Handling**: Displays asset images, using placeholders if no image URL is provided.
*   **Modals Used**:
    *   `AssetFormModal`: For creating and editing assets.
    *   `DeleteConfirmationDialog`: For confirming asset deletion.
*   **Data Source**: `assets` collection in Firestore. Asset categories for the dropdown in the modal are fetched from the `assetCategories` collection.

### 3. Asset Categories (`/assets/categories`)

*   **Purpose**: Allows users to organize assets by creating and managing categories.
*   **Key Features**:
    *   **CRUD Operations**:
        *   **Create**: Add new categories (e.g., Electronics, Furniture) via the "Add Category" button, using the `CategoryFormModal`. Saved to `assetCategories` collection.
        *   **Read**: Displays a table of existing categories with their name, description, and a count of assets belonging to that category.
        *   **Update**: Edit category details using the "Edit" option, opening `CategoryFormModal`.
        *   **Delete**: Remove categories with confirmation. A basic check prevents deletion if assets are currently assigned to that category (this check is client-side and queries the `assets` collection).
    *   **Asset Count**: Displays how many assets are associated with each category. This count is fetched dynamically.
*   **Modals Used**:
    *   `CategoryFormModal`: For creating and editing categories.
    *   `DeleteConfirmationDialog`: For confirming category deletion.
*   **Data Source**: `assetCategories` collection for category data. `assets` collection is queried to count assets per category.

### 4. Asset Reports (`/assets/reports`)

*   **Purpose**: Generate predefined and filtered reports related to assets.
*   **Key Features**:
    *   **Report Generation**:
        *   Select report type (e.g., Full Inventory, Assets by Category, Assets by Status).
        *   Apply filters: Category, Status, Purchase Date Range.
        *   The "Generate Report" button queries the `assets` collection in Firestore based on the selected parameters.
    *   **Results Display**: Shows a preview of the generated report data (e.g., first 5 rows in a table).
    *   **Data Export**: Export the full generated report data to CSV or PDF. Export buttons are enabled after a report is generated.
    *   **Filter Reset**: Clears all selected filters.
*   **Data Source**: Primarily the `assets` collection. Asset categories for filter dropdowns are fetched from `assetCategories`.

## Data Models (Firestore Collections):

*   **`assets`**: Stores individual asset records.
    *   Fields: `name` (string), `category` (string - references a name from `assetCategories`), `status` (string), `location` (string, optional), `assignedTo` (string, optional), `serialNumber` (string, optional), `cost` (number, optional), `purchaseDate` (Timestamp, optional), `warrantyEnd` (Timestamp, optional), `description` (string, optional), `image` (string, optional), `dataAiHint` (string, optional), `createdAt` (Timestamp), `updatedAt` (Timestamp).
*   **`assetCategories`**: Stores asset category definitions.
    *   Fields: `name` (string), `description` (string, optional), `createdAt` (Timestamp), `updatedAt` (Timestamp).

## Role-Based Access & Audit Logging:

*   Specific role-based access for performing CRUD operations can be enforced (e.g., only Admins can delete). This is partially implemented via UI checks (`isAdmin`) but would ideally be secured with Firestore Security Rules.
*   Audit logging for asset changes is a design consideration and would typically involve a separate `auditLogs` collection or integration with a logging service, triggered by backend functions.
