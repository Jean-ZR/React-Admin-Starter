
'use client'; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker"; 
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore'; // Added orderBy
import { exportToCSV, exportToPDF } from '@/lib/export';
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Added Badge for report results
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Added Table components for report results


interface AssetForReport {
  id: string;
  name: string;
  category: string;
  status: string;
  location?: string;
  assignedTo?: string;
  purchaseDate?: Timestamp | Date | null;
  cost?: number | null;
  [key: string]: any; // Allow other properties
}

interface Category {
  id: string;
  name: string;
}

const ALL_STATUSES = ["Active", "Inactive", "In Repair", "Disposed", "Maintenance"];


export default function AssetReportsPage() {
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportData, setReportData] = useState<AssetForReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Form state for filters
  const [reportType, setReportType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

  const fetchCategories = useCallback(async () => {
      try {
        const categoriesCollectionRef = collection(db, 'assetCategories');
        const q = query(categoriesCollectionRef, orderBy('name'));
        const snapshot = await getDocs(q);
        const categoriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        } as Category));
        setAvailableCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // toast({ title: "Error", description: "Could not fetch asset categories for report filters.", variant: "destructive" });
      }
    }, []); // Removed toast dependency to avoid potential loops if categories are used elsewhere with toast

    useEffect(() => {
      fetchCategories();
    }, [fetchCategories]);


  const handleGenerateReport = async () => {
    if (!reportType) {
      toast({ title: "Validation Error", description: "Please select a report type.", variant: "destructive"});
      return;
    }
    setIsGenerating(true);
    setReportGenerated(false);
    setReportData([]);

    try {
      const assetsCollectionRef = collection(db, 'assets');
      const queryConstraints = [];

      if (selectedCategory && selectedCategory !== 'all') {
        queryConstraints.push(where('category', '==', selectedCategory));
      }
      if (selectedStatus && selectedStatus !== 'all') {
        queryConstraints.push(where('status', '==', selectedStatus));
      }
      if (startDate) {
        queryConstraints.push(where('purchaseDate', '>=', Timestamp.fromDate(startDate)));
      }
      if (endDate) {
        // Adjust end date to include the whole day
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        queryConstraints.push(where('purchaseDate', '<=', Timestamp.fromDate(endOfDay)));
      }
      
      // Add more specific queries based on reportType
      // For example, 'depreciation' or 'audit' might need different fields or logic.
      // This is a simplified example focusing on filtering.

      const q = query(assetsCollectionRef, ...queryConstraints);
      const snapshot = await getDocs(q);
      const fetchedAssets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        purchaseDate: doc.data().purchaseDate instanceof Timestamp ? doc.data().purchaseDate.toDate() : doc.data().purchaseDate,
      } as AssetForReport));
      
      setReportData(fetchedAssets);
      setReportGenerated(true);
      if (fetchedAssets.length === 0) {
        toast({ title: "Report Generated", description: "No assets found matching your criteria.", variant: "default" });
      } else {
        toast({ title: "Report Generated", description: `Found ${fetchedAssets.length} asset(s).` });
      }

    } catch (error) {
      console.error("Error generating report:", error);
      toast({ title: "Error", description: "Could not generate report.", variant: "destructive" });
      setReportGenerated(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportResults = (format: 'csv' | 'pdf') => {
     if (!reportGenerated || reportData.length === 0) {
        toast({ title: "No Data", description: "No report data to export.", variant: "default" });
        return;
    }
    const dataToExport = reportData.map(asset => ({
        ID: asset.id,
        Name: asset.name,
        Category: asset.category,
        Status: asset.status,
        Location: asset.location || 'N/A',
        AssignedTo: asset.assignedTo || 'N/A',
        PurchaseDate: asset.purchaseDate ? (asset.purchaseDate instanceof Date ? asset.purchaseDate.toLocaleDateString() : String(asset.purchaseDate)) : 'N/A',
        Cost: asset.cost !== null && asset.cost !== undefined ? `$${asset.cost.toFixed(2)}` : 'N/A',
    }));

    if (format === 'csv') {
        exportToCSV(dataToExport, `asset_report_${reportType || 'custom'}`);
    } else {
        const columns = [
            { header: 'ID', dataKey: 'ID' },
            { header: 'Name', dataKey: 'Name' },
            { header: 'Category', dataKey: 'Category' },
            { header: 'Status', dataKey: 'Status' },
            { header: 'Location', dataKey: 'Location' },
            { header: 'Assigned To', dataKey: 'AssignedTo' },
            { header: 'Purchase Date', dataKey: 'PurchaseDate' },
            { header: 'Cost', dataKey: 'Cost' },
        ];
        exportToPDF({
            data: dataToExport,
            columns: columns,
            title: `Asset Report: ${reportType || 'Custom'}`,
            filename: `asset_report_${reportType || 'custom'}.pdf`,
        });
    }
  };

   const handleResetFilters = () => {
    setReportType('');
    setSelectedCategory('');
    setSelectedStatus('');
    setStartDate(undefined);
    setEndDate(undefined);
    setReportGenerated(false);
    setReportData([]);
    toast({ title: "Filters Reset", description: "Report filters have been cleared." });
  };


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
            <label htmlFor="reportType" className="text-sm font-medium">Report Type *</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_inventory">Full Inventory</SelectItem>
                <SelectItem value="by_category">Assets by Category</SelectItem>
                <SelectItem value="by_status">Assets by Status</SelectItem>
                <SelectItem value="by_location">Assets by Location (Placeholder)</SelectItem>
                 {/* <SelectItem value="depreciation">Depreciation Schedule (Placeholder)</SelectItem>
                 <SelectItem value="audit">Asset Audit Trail (Placeholder)</SelectItem>
                 <SelectItem value="warranty">Warranty Expiration (Placeholder)</SelectItem>
                 <SelectItem value="assignment">Asset Assignment (Placeholder)</SelectItem> */}
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">Category (Optional)</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">Status (Optional)</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {ALL_STATUSES.map(stat => (
                    <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
             <label htmlFor="startDate" className="text-sm font-medium">Purchase Date Start (Optional)</label>
             <DatePicker id="startDate" value={startDate} onSelect={setStartDate} />
           </div>
           <div className="space-y-2">
             <label htmlFor="endDate" className="text-sm font-medium">Purchase Date End (Optional)</label>
             <DatePicker id="endDate" value={endDate} onSelect={setEndDate} />
           </div>
           <div className="lg:col-span-3 flex justify-end gap-2 mt-4">
             <Button variant="outline" onClick={handleResetFilters} disabled={isGenerating}>Reset</Button>
             <Button onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGenerating ? "Generating..." : "Generate Report"}
            </Button>
           </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Report Results</CardTitle>
            <CardDescription>
                 {reportGenerated
                    ? `Report generated with ${reportData.length} asset(s).`
                    : "Generated report will appear here."}
            </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[150px]">
             {isGenerating ? (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2">Generating report data...</p>
                </div>
             ) : reportGenerated && reportData.length > 0 ? (
                 <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Cost</TableHead>
                                <TableHead>Purchase Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.slice(0, 5).map(asset => ( // Display first 5 rows as preview
                                <TableRow key={asset.id}>
                                    <TableCell className="text-xs">{asset.id}</TableCell>
                                    <TableCell>{asset.name}</TableCell>
                                    <TableCell>{asset.category}</TableCell>
                                    <TableCell><Badge variant={asset.status === "Active" ? "default" : "outline"}>{asset.status}</Badge></TableCell>
                                    <TableCell>{asset.cost ? `$${asset.cost.toFixed(2)}` : 'N/A'}</TableCell>
                                    <TableCell>{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {reportData.length > 5 && <p className="text-xs text-muted-foreground mt-2">Showing first 5 of {reportData.length} results. Export to see all.</p>}
                 </div>
             ) : reportGenerated && reportData.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No assets found matching the selected criteria.</p>
             ) : (
                <p className="text-sm text-muted-foreground italic">No report generated yet. Select parameters above and click "Generate Report".</p>
             )}
        </CardContent>
         <CardFooter className="flex justify-end gap-2">
           <Button variant="outline" size="sm" disabled={!reportGenerated || reportData.length === 0 || isGenerating} onClick={() => handleExportResults('csv')}>Export as CSV</Button>
           <Button variant="outline" size="sm" disabled={!reportGenerated || reportData.length === 0 || isGenerating} onClick={() => handleExportResults('pdf')}>Export as PDF</Button>
         </CardFooter>
      </Card>

      <p className="text-sm text-muted-foreground">
        Generate detailed reports with customizable parameters. Audit logs and role-based access are applied.
      </p>
    </div>
  );
}

