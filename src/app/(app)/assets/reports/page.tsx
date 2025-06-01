
'use client'; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker"; 
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore'; 
import { exportToCSV, exportToPDF } from '@/lib/export';
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; 
// Removed Tabs import as navigation is now in sidebar for Assets


interface AssetForReport {
  id: string;
  name: string;
  category: string;
  status: string;
  location?: string;
  assignedTo?: string;
  purchaseDate?: Timestamp | Date | null;
  cost?: number | null;
  [key: string]: any; 
}

interface Category {
  id: string;
  name: string;
}

const ALL_STATUSES = ["Active", "Inactive", "In Repair", "Disposed", "Maintenance"];


export default function AssetReportsPage() {
  // Removed usePathname
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportData, setReportData] = useState<AssetForReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

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
      }
    }, []); 

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
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        queryConstraints.push(where('purchaseDate', '<=', Timestamp.fromDate(endOfDay)));
      }
      
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
      {/* Removed Tabs navigation */}
      <h1 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
        Reportes de Activos
      </h1>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Generar Reporte de Activos</CardTitle>
          <CardDescription className="text-muted-foreground">Personaliza parámetros para generar reportes detallados de activos.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="reportType" className="text-sm font-medium text-muted-foreground">Tipo de Reporte *</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="reportType" className="bg-background border-input text-foreground">
                <SelectValue placeholder="Seleccionar tipo de reporte" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                <SelectItem value="full_inventory">Inventario Completo</SelectItem>
                <SelectItem value="by_category">Activos por Categoría</SelectItem>
                <SelectItem value="by_status">Activos por Estado</SelectItem>
                <SelectItem value="by_location">Activos por Ubicación (Placeholder)</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium text-muted-foreground">Categoría (Opcional)</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category" className="bg-background border-input text-foreground">
                <SelectValue placeholder="Todas las Categorías" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                 <SelectItem value="all">Todas las Categorías</SelectItem>
                {availableCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium text-muted-foreground">Estado (Opcional)</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="status" className="bg-background border-input text-foreground">
                <SelectValue placeholder="Todos los Estados" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                <SelectItem value="all">Todos los Estados</SelectItem>
                {ALL_STATUSES.map(stat => (
                    <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
             <label htmlFor="startDate" className="text-sm font-medium text-muted-foreground">Fecha de Compra Inicio (Opcional)</label>
             <DatePicker id="startDate" value={startDate} onSelect={setStartDate} />
           </div>
           <div className="space-y-2">
             <label htmlFor="endDate" className="text-sm font-medium text-muted-foreground">Fecha de Compra Fin (Opcional)</label>
             <DatePicker id="endDate" value={endDate} onSelect={setEndDate} />
           </div>
           <div className="lg:col-span-3 flex justify-end gap-2 mt-4">
             <Button variant="outline" onClick={handleResetFilters} disabled={isGenerating} className="border-input hover:bg-accent hover:text-accent-foreground">Reiniciar</Button>
             <Button onClick={handleGenerateReport} disabled={isGenerating} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGenerating ? "Generando..." : "Generar Reporte"}
            </Button>
           </div>
        </CardContent>
      </Card>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
            <CardTitle className="text-foreground">Resultados del Reporte</CardTitle>
            <CardDescription className="text-muted-foreground">
                 {reportGenerated
                    ? `Reporte generado con ${reportData.length} activo(s).`
                    : "El reporte generado aparecerá aquí."}
            </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[150px]">
             {isGenerating ? (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Generando datos del reporte...</p>
                </div>
             ) : reportGenerated && reportData.length > 0 ? (
                 <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border">
                                <TableHead className="text-muted-foreground">ID</TableHead>
                                <TableHead className="text-muted-foreground">Nombre</TableHead>
                                <TableHead className="text-muted-foreground">Categoría</TableHead>
                                <TableHead className="text-muted-foreground">Estado</TableHead>
                                <TableHead className="text-muted-foreground">Costo</TableHead>
                                <TableHead className="text-muted-foreground">Fecha Compra</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.slice(0, 5).map(asset => ( 
                                <TableRow key={asset.id} className="border-border hover:bg-muted/50">
                                    <TableCell className="text-xs text-muted-foreground">{asset.id}</TableCell>
                                    <TableCell className="text-foreground">{asset.name}</TableCell>
                                    <TableCell className="text-foreground">{asset.category}</TableCell>
                                    <TableCell><Badge variant={asset.status === "Active" ? "default" : "outline"} className={asset.status === "Active" ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700' : 'text-muted-foreground border-border'}>{asset.status}</Badge></TableCell>
                                    <TableCell className="text-foreground">{asset.cost ? `$${asset.cost.toFixed(2)}` : 'N/A'}</TableCell>
                                    <TableCell className="text-foreground">{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {reportData.length > 5 && <p className="text-xs text-muted-foreground mt-2">Mostrando los primeros 5 de {reportData.length} resultados. Exporta para ver todos.</p>}
                 </div>
             ) : reportGenerated && reportData.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No se encontraron activos que coincidan con los criterios seleccionados.</p>
             ) : (
                <p className="text-sm text-muted-foreground italic">Aún no se ha generado ningún reporte. Selecciona parámetros arriba y haz clic en "Generar Reporte".</p>
             )}
        </CardContent>
         <CardFooter className="flex justify-end gap-2">
           <Button variant="outline" size="sm" disabled={!reportGenerated || reportData.length === 0 || isGenerating} onClick={() => handleExportResults('csv')} className="border-input hover:bg-accent hover:text-accent-foreground">Exportar como CSV</Button>
           <Button variant="outline" size="sm" disabled={!reportGenerated || reportData.length === 0 || isGenerating} onClick={() => handleExportResults('pdf')} className="border-input hover:bg-accent hover:text-accent-foreground">Exportar como PDF</Button>
         </CardFooter>
      </Card>

      <p className="text-sm text-muted-foreground">
        Genera reportes detallados con parámetros personalizables. Se aplican registros de auditoría y acceso basado en roles.
      </p>
    </div>
  );
}

    