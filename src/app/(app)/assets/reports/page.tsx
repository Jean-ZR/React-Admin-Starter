import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker"; // Assuming a DatePicker component exists or will be created

export default function AssetReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold leading-none tracking-tight">
        Asset Reports
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Generate Asset Report</CardTitle>
          <CardDescription>Customize parameters to generate detailed asset reports.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="reportType" className="text-sm font-medium">Report Type</label>
            <Select>
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inventory">Full Inventory</SelectItem>
                <SelectItem value="depreciation">Depreciation Schedule</SelectItem>
                <SelectItem value="byCategory">Assets by Category</SelectItem>
                <SelectItem value="byLocation">Assets by Location</SelectItem>
                 <SelectItem value="audit">Asset Audit Trail</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">Category (Optional)</label>
            <Select>
              <SelectTrigger id="category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="office">Office Supplies</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">Status (Optional)</label>
            <Select>
              <SelectTrigger id="status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="inRepair">In Repair</SelectItem>
                <SelectItem value="disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>
          </div>
           {/* Assuming DatePicker component exists */}
           {/* <div className="space-y-2">
             <label htmlFor="startDate" className="text-sm font-medium">Start Date (Optional)</label>
             <DatePicker id="startDate" />
           </div>
           <div className="space-y-2">
             <label htmlFor="endDate" className="text-sm font-medium">End Date (Optional)</label>
             <DatePicker id="endDate" />
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
            <CardDescription>Generated report will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground italic">No report generated yet. Select parameters above and click "Generate Report".</p>
            {/* Report data table or chart would go here */}
        </CardContent>
         <CardFooter className="flex justify-end">
           <Button variant="outline" size="sm" disabled>Export Results</Button>
         </CardFooter>
      </Card>

      <p className="text-sm text-muted-foreground">
        Generate detailed reports with customizable parameters. Audit logs and role-based access are applied.
      </p>
    </div>
  );
}
