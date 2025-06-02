
'use client'; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, BarChart3, Users, Clock, FileDown } from "lucide-react"; 
import { useState } from "react";
// Removed Link, usePathname, Tabs, TabsList, TabsTrigger

export default function OperationalReportsPage() {
    const [reportGenerated, setReportGenerated] = useState(false);

    const handleGenerateReport = () => {
        console.log("Generating operational report...");
        setReportGenerated(true);
        alert("Report generation functionality not yet implemented. Results area updated conceptually.");
    };

    const handleExportResults = () => {
        console.log("Exporting operational report results...");
        alert("Export functionality not yet implemented.");
    };

    const handleResetFilters = () => {
        console.log("Resetting operational report filters...");
        setReportGenerated(false);
        alert("Filter reset functionality not yet implemented.");
    };

  return (
    <div className="space-y-6">
       {/* Removed Tabs navigation */}
       {/* Title is now managed by AppLayout */}
      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Generar Reporte Operacional</CardTitle>
          <CardDescription className="text-muted-foreground">Analizar métricas de rendimiento e indicadores de eficiencia.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="reportTypeOps" className="text-sm font-medium text-muted-foreground">Tipo de Reporte</label>
            <Select>
              <SelectTrigger id="reportTypeOps" className="bg-background border-input text-foreground">
                <SelectValue placeholder="Seleccionar tipo de reporte" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                <SelectItem value="servicePerf">Rendimiento del Servicio (Tickets)</SelectItem>
                <SelectItem value="assetUtil">Utilización de Activos</SelectItem>
                <SelectItem value="techPerf">Rendimiento de Técnicos</SelectItem>
                <SelectItem value="clientActivity">Resumen de Actividad del Cliente</SelectItem>
                <SelectItem value="inventoryTurn">Frecuencia de Movimiento de Inventario</SelectItem>
              </SelectContent>
            </Select>
          </div>
            <div className="space-y-2">
             <label htmlFor="departmentOps" className="text-sm font-medium text-muted-foreground">Departamento/Equipo (Opcional)</label>
             <Select>
              <SelectTrigger id="departmentOps" className="bg-background border-input text-foreground">
                <SelectValue placeholder="Todos los Departamentos" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                 <SelectItem value="all">Todos los Departamentos</SelectItem>
                <SelectItem value="support">Equipo de Soporte</SelectItem>
                <SelectItem value="sales">Equipo de Ventas</SelectItem>
                <SelectItem value="logistics">Logística</SelectItem>
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
                    ? "Reporte operacional generado."
                    : "El reporte operacional generado aparecerá aquí."}
            </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportGenerated ? (
                 <>
                <Card className="bg-muted/30 border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">Tiempo Prom. Resolución Ticket</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">4.2 horas</div>
                        <p className="text-xs text-muted-foreground">-8% del último período</p>
                    </CardContent>
                </Card>
                <Card className="bg-muted/30 border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">Tasa Utilización de Activos</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">78%</div>
                        <p className="text-xs text-muted-foreground">Basado en asignaciones activas</p>
                    </CardContent>
                </Card>
                <Card className="md:col-span-2 bg-muted/30 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Carga de Tickets por Técnico (Ejemplo)</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center min-h-[200px]">
                        <Users className="h-24 w-24 text-muted-foreground" />
                        <p className="text-muted-foreground italic ml-4">Gráfica mostrando tickets por técnico</p>
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
        Genera reportes de rendimiento operacional y eficiencia. Requiere agregación de datos. Se aplican registros de auditoría y acceso basado en roles.
      </p>
    </div>
  );
}
