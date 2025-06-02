
'use client'; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, LineChart, PieChart, FileDown, Loader2 } from "lucide-react"; 
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
// Removed Tabs, TabsList, TabsTrigger, Link, usePathname as navigation is now in sidebar

export default function InventoryReportsPage() {
    // Removed usePathname
    const [reportGenerated, setReportGenerated] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();


    const handleGenerateReport = () => {
        setIsGenerating(true);
        console.log("Generating inventory report...");
        // Simulate report generation
        setTimeout(() => {
            setReportGenerated(true);
            setIsGenerating(false);
            toast({ title: "Report Generated", description: "Inventory report results are now available (conceptual)." });
        }, 1500);
    };

    const handleExportResults = () => {
        if (!reportGenerated) {
             toast({ title: "No Data", description: "Please generate a report first.", variant: "default" });
            return;
        }
        console.log("Exporting inventory report results...");
        toast({ title: "Export Action", description: "Export functionality placeholder for inventory report." });
    };

    const handleResetFilters = () => {
        console.log("Resetting inventory report filters...");
        setReportGenerated(false);
        // TODO: Reset actual filter states here
        toast({ title: "Filters Reset", description: "Inventory report filters have been cleared." });
    };

  return (
    <div className="space-y-6">
       {/* Title is now handled by layout.tsx */}

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Generate Inventory Report</CardTitle>
          <CardDescription className="text-muted-foreground">Analytics and forecasting tools for inventory management.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="reportTypeInv" className="text-sm font-medium text-muted-foreground">Report Type</label>
            <Select>
              <SelectTrigger id="reportTypeInv" className="bg-background border-input text-foreground">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
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
            <label htmlFor="categoryInv" className="text-sm font-medium text-muted-foreground">Category (Optional)</label>
            <Select>
              <SelectTrigger id="categoryInv" className="bg-background border-input text-foreground">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                 <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="peripherals">Peripherals</SelectItem>
                <SelectItem value="displays">Displays</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>
            <div className="space-y-2">
            <label htmlFor="locationInv" className="text-sm font-medium text-muted-foreground">Location (Optional)</label>
            <Select>
              <SelectTrigger id="locationInv" className="bg-background border-input text-foreground">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                 <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="shelfA1">Shelf A1</SelectItem>
                <SelectItem value="shelfA2">Shelf A2</SelectItem>
                 <SelectItem value="shelfB1">Shelf B1</SelectItem>
                  <SelectItem value="shelfC3">Shelf C3</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="lg:col-span-3 flex justify-end gap-2 mt-4">
             <Button variant="outline" onClick={handleResetFilters} disabled={isGenerating} className="border-input hover:bg-accent hover:text-accent-foreground">Reset</Button>
             <Button onClick={handleGenerateReport} disabled={isGenerating} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGenerating ? "Generating..." : "Generate Report"}
            </Button>
           </div>
        </CardContent>
      </Card>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
            <CardTitle className="text-foreground">Report Results</CardTitle>
            <CardDescription className="text-muted-foreground">
                 {reportGenerated
                    ? "Inventory report generated."
                    : "Generated inventory report will appear here (e.g., tables, charts)."}
            </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
            {isGenerating ? (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Generating report data...</p>
                </div>
            ) : reportGenerated ? (
                <p className="text-sm text-muted-foreground">Inventory report data/charts would be displayed here.</p>
            ) : (
                <div className="text-center text-muted-foreground italic space-y-4">
                <p>No report generated yet. Select parameters above and click "Generate Report".</p>
                    <div className="flex gap-8 justify-center text-muted-foreground/50">
                        <BarChart className="h-16 w-16" />
                        <LineChart className="h-16 w-16" />
                        <PieChart className="h-16 w-16" />
                    </div>
                </div>
            )}
        </CardContent>
         <CardFooter className="flex justify-end border-t border-border pt-4">
           <Button
              variant="outline"
              size="sm"
              disabled={!reportGenerated || isGenerating}
              onClick={handleExportResults}
              className="gap-1 border-input hover:bg-accent hover:text-accent-foreground"
            >
                <FileDown className="h-3.5 w-3.5" />
                 Export Results
            </Button>
         </CardFooter>
      </Card>

      <p className="text-sm text-muted-foreground">
        Generate inventory analytics and forecasting reports. Audit logs and role-based access are applied.
      </p>
    </div>
  );
}
    
