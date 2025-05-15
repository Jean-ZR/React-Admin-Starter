
# Reporting System Documentation

The Reporting System section provides tools for generating various reports, including financial summaries, operational metrics, and user-defined custom reports. It aims to leverage data from various Firestore collections to provide insights.

## Pages and Functionality:

### 1. Financial Reports (`/reports/financial`)

*   **Purpose**: To generate reports related to the financial aspects of the business, such as revenue, expenses, and profitability.
*   **Key Features**:
    *   **Report Selection**: Dropdown to select the type of financial report (e.g., Profit & Loss, Revenue by Client/Service, Expense Breakdown).
    *   **Parameter Selection**: Filters for period (Month-to-Date, Year-to-Date, Custom Range via date pickers - UI placeholders).
    *   **Report Generation**:
        *   The "Generate Report" button triggers data fetching and processing.
        *   Currently simulates fetching client data and assigning mock revenue for "Revenue by Client" type reports.
        *   A loading state is shown during generation.
    *   **Results Display**:
        *   Displays generated data in a table format (e.g., Client and Revenue).
        *   Placeholder stat cards for key metrics like Total Revenue, Total Expenses.
        *   Placeholder area for charts.
    *   **Data Export**: "Export Report" button (CSV/PDF) becomes active after report generation, exporting the displayed `reportData`.
*   **Data Source**: Would ideally query collections like `transactions`, `invoices`, `expenses`, and `clients` from Firestore. Currently uses mock data for some report types.

### 2. Operational Reports (`/reports/operational`)

*   **Purpose**: To analyze performance metrics, efficiency indicators, and other operational data.
*   **Key Features**:
    *   **Report Selection**: Dropdown for report types (e.g., Service Performance, Asset Utilization, Technician Performance).
    *   **Parameter Selection**: Filters like department or date range (date pickers are UI placeholders).
    *   **Report Generation**:
        *   "Generate Report" button triggers data fetching.
        *   Currently implements "Asset Utilization" by fetching data from the `assets` collection and calculating assigned vs. unassigned counts.
        *   Includes a loading state.
    *   **Results Display**:
        *   Displays generated data in a table (e.g., Asset Status and Count).
        *   Placeholder stat cards for metrics like Average Ticket Resolution Time.
        *   Placeholder area for charts.
    *   **Data Export**: "Export Report" button (CSV/PDF) enabled after generation, using the `reportData`.
*   **Data Source**: Would query collections like `serviceTickets`, `assets`, `users` (for technician performance), and `inventoryMovements` from Firestore. Currently fetches from `assets` for the "Asset Utilization" example.

### 3. Custom Reports (`/reports/custom`)

*   **Purpose**: Provides a UI for users to build their own reports by selecting data sources, fields, filters, and grouping/sorting options.
*   **Key Features (Primarily UI Placeholders)**:
    *   **Data Source Selection**: Dropdown to choose a data module (e.g., Asset List, Client Directory, Stock Levels).
    *   **Field Selection**: Checkboxes to select fields from the chosen data source (currently static example fields).
    *   **Filter Definition**: UI to add multiple filter conditions (Field, Operator, Value).
    *   **Grouping & Sorting**: UI to specify a field to group by and multiple fields to sort by (with ascending/descending order).
    *   **Action Buttons (Placeholders)**:
        *   "Load Saved Report": To load a previously saved report configuration.
        *   "Save Report": To save the current report configuration.
        *   "Preview Report": To see a sample of the report.
        *   "Generate & Export": To generate the full report and trigger a download.
*   **Data Source**: This page is UI-only. A full implementation would require:
    *   Dynamic loading of fields based on the selected data source schema.
    *   A backend or complex client-side query builder to translate user selections into Firestore queries.
    *   Mechanisms to save/load report configurations (potentially in a `reportConfigurations` Firestore collection).

## Data Integration & Future Development:

*   **Firestore Queries**: The core of this system relies on constructing efficient Firestore queries based on user selections. This can become complex, especially for aggregations or "join-like" operations which Firestore handles differently than SQL.
*   **Data Aggregation**: For many reports (e.g., sums, averages, counts over time), data might need to be aggregated. This can be done client-side for smaller datasets or, for better performance and scalability, using Cloud Functions to perform aggregations and store results in summary collections.
*   **Charting**: Integration of a charting library (like Recharts) is essential for visualizing report data.
*   **Security**: Firestore Security Rules must be carefully designed to allow users to access only the data relevant to their role and the reports they are permitted to generate.
*   **Performance**: For large datasets, consider pagination for report results, server-side processing for complex reports, and optimized Firestore indexing.
*   **Saved Reports**: Storing user-defined report configurations in Firestore would allow users to re-run custom reports easily.
