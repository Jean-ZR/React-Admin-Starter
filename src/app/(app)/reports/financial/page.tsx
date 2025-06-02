
'use client'; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, DollarSign, TrendingUp, TrendingDown, FileDown } from "lucide-react"; 
import { useState } from "react";
// Removed Link, usePathname, Tabs, TabsList, TabsTrigger

export default function FinancialReportsPage() {
    const [reportGenerated, setReportGenerated] = useState(false);

    const handleGenerateReport = () => {
        console.log("Generating financial report...");
        setReportGenerated(true);
        alert("Report generation functionality not yet implemented. Results area updated conceptually.");
    };

    const handleExportResults = () => {
        console.log("Exporting financial report results...");
        alert("Export functionality not yet implemented.");
    };

    const handleResetFilters = () => {
        console.log("Resetting financial report filters...");
        setReportGenerated(false);
        alert("Filter reset functionality not yet implemented.");
    };


  return (
    <div className="space-y-6">
      {/* Removed Tabs navigation */}
      {/* Title is now managed by AppLayout */}
      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Generar Reporte Financiero</CardTitle>
          <CardDescription className="text-muted-foreground">Analizar ingresos, gastos y rentabilidad.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="reportTypeFin" className="text-sm font-medium text-muted-foreground">Tipo de Reporte</label>
            <Select>
              <SelectTrigger id="reportTypeFin" className="bg-background border-input text-foreground">
                <SelectValue placeholder="Seleccionar tipo de reporte" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                <SelectItem value="pnl">Estado de Pérdidas y Ganancias</SelectItem>
                <SelectItem value="revenue">Ingresos por Cliente/Servicio</SelectItem>
                <SelectItem value="expenses">Desglose de Gastos</SelectItem>
                <SelectItem value="cashflow">Estado de Flujo de Efectivo</SelectItem>
                 <SelectItem value="ar_aging">Antigüedad de Cuentas por Cobrar</SelectItem>
              </SelectContent>
            </Select>
          </div>
            <div className="space-y-2">
             <label htmlFor="periodFin" className="text-sm font-medium text-muted-foreground">Período</label>
             <Select>
              <SelectTrigger id="periodFin" className="bg-background border-input text-foreground">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                <SelectItem value="mtd">Mes Actual</SelectItem>
                <SelectItem value="qtd">Trimestre Actual</SelectItem>
                <SelectItem value="ytd">Año Actual</SelectItem>
                <SelectItem value="last_month">Último Mes</SelectItem>
                <SelectItem value="last_quarter">Último Trimestre</SelectItem>
                <SelectItem value="custom">Rango Personalizado</SelectItem> 
              </SelectContent>
            </Select>
           </div>
           <div className="lg:col-span-3 flex justify-end gap-2 mt-4">
             <Button variant="outline" onClick={handleResetFilters} className="border-input hover:bg-accent hover:text-accent-foreground">Reiniciar</Button>
             <Button onClick={handleGenerateReport} className="bg-primary text-primary-foreground hover:bg-primary/90">Generar Reporte</Button>
           </div>
        </CardContent>
      </Card>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
            <CardTitle className="text-foreground">Resultados del Reporte</CardTitle>
            <CardDescription className="text-muted-foreground">
                 {reportGenerated
                    ? "Reporte financiero generado."
                    : "El reporte financiero generado aparecerá aquí (ej., tablas, gráficas)."}
            </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] grid grid-cols-1 md:grid-cols-2 gap-6">
             {reportGenerated ? (
                 <>
                    <Card className="bg-muted/30 border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Ingresos Totales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">$45,231.89</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500"/> +20.1% del último mes
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-muted/30 border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Gastos Totales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">$21,876.50</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingDown className="h-3 w-3 text-red-500"/> +5.2% del último mes
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2 bg-muted/30 border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Tendencia Ingresos vs Gastos (Ejemplo)</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center min-h-[200px]">
                            <AreaChart className="h-24 w-24 text-muted-foreground" />
                            <p className="text-muted-foreground italic ml-4">Área de visualización de gráfica</p>
                        </CardContent>
                    </Card>
                 </>
             ) : (
                 <p className="text-sm text-muted-foreground italic md:col-span-2 text-center pt-10">Aún no se ha generado ningún reporte.</p>
             )}
        </CardContent>
         <CardFooter className="flex justify-end border-t border-border pt-4">
           <Button
              variant="outline"
              size="sm"
              disabled={!reportGenerated}
              onClick={handleExportResults}
              className="gap-1 border-input hover:bg-accent hover:text-accent-foreground"
            >
              <FileDown className="h-3.5 w-3.5" />
              Exportar Reporte
            </Button>
         </CardFooter>
      </Card>

      <p className="text-sm text-muted-foreground">
        Genera reportes de análisis financiero. Requiere integración con fuente de datos financieros. Se aplican registros de auditoría y acceso basado en roles.
      </p>
    </div>
  );
}
