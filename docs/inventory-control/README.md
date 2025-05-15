
# Inventory Control Documentation

The Inventory Control section provides tools for managing stock levels, tracking item movements, receiving alerts for low stock, and generating inventory-related reports. Data is persisted in Firebase Firestore.

## Pages and Functionality:

### 1. Stock Management (`/inventory/stock`)

*   **Purpose**: Real-time tracking of all inventory items, their quantities, and details.
*   **Key Features**:
    *   **CRUD Operations**:
        *   **Create**: Add new inventory items via the "Add Item" button, using the `ItemFormModal`. Data is saved to the `inventoryItems` collection.
        *   **Read**: Displays a table of inventory items including image, Name (SKU), Category, Location, Status (In Stock, Low Stock, Out of Stock based on quantity vs. reorder level), Quantity, and Cost. Data is fetched in real-time from Firestore.
        *   **Update**: Edit existing items through an "Edit" option, opening `ItemFormModal`.
        *   **Delete**: Remove items with confirmation via `DeleteConfirmationDialog`.
    *   **Filtering**:
        *   Filter by `category` using a multi-select dropdown (categories are dynamically populated).
        *   Filter by `status` ("In Stock", "Low Stock", "Out of Stock").
    *   **Search**: Client-side search by item name, SKU, category, or location.
    *   **Data Export**: Export the current list of items to CSV or PDF.
*   **Modals Used**:
    *   `ItemFormModal`: For creating and editing inventory items.
    *   `DeleteConfirmationDialog`: For confirming item deletion.
*   **Data Source**: `inventoryItems` collection in Firestore.

### 2. Stock Movement (`/inventory/movements`)

*   **Purpose**: Monitor and log all incoming (Inbound), outgoing (Outbound), adjustments, and transfers of inventory items.
*   **Key Features**:
    *   **CRUD Operations for Logs**:
        *   **Create**: Record new movements via the "Record Movement" button, using the `MovementFormModal`. Logs are saved to the `inventoryMovements` collection.
        *   **Read**: Displays a table of movement logs with details: Date, Type, Item (SKU), Quantity changed, Source/Destination, User who recorded, and Notes. Fetches data in real-time.
        *   **Update**: Edit existing movement logs (e.g., to correct notes or quantity if no stock impact has occurred yet) via an "Edit" option.
        *   **Delete**: Remove movement log entries with confirmation.
    *   **Item Selection**: The `MovementFormModal` includes a dropdown to select existing inventory items by SKU/Name.
    *   **Filtering**: Filter logs by movement `type` (Inbound, Outbound, etc.). Client-side search is also available.
    *   **Data Export**: Export the movement log to CSV or PDF.
    *   **Important Note**: This section logs movements. Automatic updates to the main `inventoryItems` quantity based on these logs are **not yet implemented** in this iteration and would require Firestore Transactions or Cloud Functions for data integrity.
*   **Modals Used**:
    *   `MovementFormModal`: For recording and editing movements.
    *   `DeleteConfirmationDialog`: For confirming deletion of movement logs.
*   **Data Source**: `inventoryMovements` collection. `inventoryItems` collection is read to populate item selection in the modal.

### 3. Low Stock Alerts (`/inventory/alerts`)

*   **Purpose**: Automatically identify and display inventory items that have fallen below their predefined reorder level.
*   **Key Features**:
    *   **Alert Display**: Fetches all items from `inventoryItems` and filters them client-side to show only items where `quantity <= reorderLevel`.
    *   **Table View**: Displays low stock items with Image, Name (SKU), Current Quantity, Reorder Level, and Location.
    *   **"Reorder" Button (Placeholder)**: A button to initiate a reordering process (currently a UI placeholder).
    *   **"Configure Alerts" Button (Placeholder)**: Navigation to where alert thresholds might be configured globally (currently a UI placeholder).
*   **Data Source**: `inventoryItems` collection in Firestore.

### 4. Inventory Reports (`/inventory/reports`)

*   **Purpose**: Generate analytical reports for inventory valuation, turnover, aging, etc.
*   **Key Features (Partially Implemented - focuses on data fetching)**:
    *   **Report Generation**:
        *   Select report type (e.g., Current Stock Levels, Inventory Valuation, Low Stock Report).
        *   Apply filters (e.g., Category, Location). Date range filters are UI placeholders.
        *   "Generate Report" button queries the `inventoryItems` collection based on parameters.
            *   Example: "Inventory Valuation" calculates `cost * quantity` for each item.
    *   **Results Display (Conceptual)**: Shows a placeholder area for tables or charts.
    *   **Data Export**: Export generated report data to CSV or PDF. Export buttons are enabled after a report is "generated".
*   **Data Source**: Primarily the `inventoryItems` collection.

## Data Models (Firestore Collections):

*   **`inventoryItems`**: Stores individual inventory item records.
    *   Fields: `name` (string), `sku` (string), `category` (string), `quantity` (number), `reorderLevel` (number), `cost` (number, optional), `location` (string, optional), `description` (string, optional), `image` (string, optional), `dataAiHint` (string, optional), `createdAt` (Timestamp), `updatedAt` (Timestamp).
*   **`inventoryMovements`**: Stores logs of stock movements.
    *   Fields: `itemId` (string, ID from `inventoryItems`), `itemName` (string, denormalized), `itemSku` (string, denormalized), `type` (string: "Inbound", "Outbound", "Adjustment", "Transfer"), `quantity` (number, positive or negative reflecting change), `sourceOrDestination` (string, optional), `notes` (string, optional), `user` (string, ID or name of user performing action), `createdAt` (Timestamp), `updatedAt` (Timestamp).

## Role-Based Access & Audit Logging:

*   Permissions for adding/editing items, recording movements, and accessing reports would be controlled by user roles and Firestore Security Rules.
*   Changes to inventory levels and movement logs should be audit logged.
