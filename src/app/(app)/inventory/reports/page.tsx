import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"; // Assuming this component exists
import { BarChart, LineChart, PieChart } from "lucide-react"; // Example icons

export default function InventoryReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold leading-none tracking-tight">
        Inventory Reports
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Generate Inventory Report</CardTitle>
          <CardDescription>Analytics and forecasting tools for inventory management.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="reportTypeInv" className="text-sm font-medium">Report Type</label>
            <Select>
              <SelectTrigger id="reportTypeInv">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stockLevel">Current Stock Levels</SelectItem>
                <SelectItem value="valuation">Inventory Valuation</SelectItem>
                <SelectItem value="turnover">Stock Turnover Rate</SelectItem>
                <SelectItem value="movementLog">Movement Log Summary</SelectItem>
                <SelectItem value="lowStock">Low Stock Report</SelectItem>
                 <SelectItem value="aging">Inventory Aging</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <label htmlFor="categoryInv" className="text-sm font-medium">Category (Optional)</label>
            <Select>
              <SelectTrigger id="categoryInv">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="peripherals">Peripherals</SelectItem>
                <SelectItem value="displays">Displays</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>
            <div className="space-y-2">
            <label htmlFor="locationInv" className="text-sm font-medium">Location (Optional)</label>
            <Select>
              <SelectTrigger id="locationInv">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="shelfA1">Shelf A1</SelectItem>
                <SelectItem value="shelfA2">Shelf A2</SelectItem>
                 <SelectItem value="shelfB1">Shelf B1</SelectItem>
                  <SelectItem value="shelfC3">Shelf C3</SelectItem>
              </SelectContent>
            </Select>
          </div>
           {/* Assuming DatePicker component exists */}
           {/* <div className="space-y-2">
             <label htmlFor="startDateInv" className="text-sm font-medium">Start Date (Optional)</label>
             <DatePicker id="startDateInv" />
           </div>
           <div className="space-y-2">
             <label htmlFor="endDateInv" className="text-sm font-medium">End Date (Optional)</label>
             <DatePicker id="endDateInv" />
           </div> */}
           <div className="lg:col-span-3 flex justify-end gap-2 mt-4">
             <Button variant="outline">Reset</Button>
             <Button>Generate Report</Button>
           </div>
        </CardContent>
      </Card>

      {/* Placeholder for Report Results */}
      <Card>
        <CardHeader>
            <CardTitle>Report Results</CardTitle>
            <CardDescription>Generated inventory report will appear here (e.g., tables, charts).</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
            {/* Example visualization placeholders */}
            <div className="text-center text-muted-foreground italic space-y-4">
               <p>No report generated yet. Select parameters above and click "Generate Report".</p>
                <div className="flex gap-8 justify-center text-gray-400">
                    <BarChart className="h-16 w-16" />
                    <LineChart className="h-16 w-16" />
                    <PieChart className="h-16 w-16" />
                </div>
             </div>
            {/* Actual report data/charts would replace this */}
        </CardContent>
         <CardFooter className="flex justify-end">
           <Button variant="outline" size="sm" disabled>Export Results</Button>
         </CardFooter>
      </Card>

      <p className="text-sm text-muted-foreground">
        Generate inventory analytics and forecasting reports. Audit logs and role-based access are applied.
      </p>
    </div>
  );
}
