
'use client'; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, FileCog, PlusCircle, Trash2, GripVertical, Eye } from "lucide-react"; 
// Removed Link, usePathname, Tabs, TabsList, TabsTrigger

export default function CustomReportsPage() {

    const handleGenerateExport = () => {
        console.log("Generating and exporting custom report...");
        alert("Custom report generation and export functionality not yet implemented.");
    };

     const handlePreviewReport = () => {
        console.log("Previewing custom report...");
         alert("Report preview functionality not yet implemented.");
    };

    const handleLoadReport = () => {
        console.log("Loading saved report configuration...");
        alert("Load Saved Report functionality not yet implemented.");
    };

    const handleSaveReport = () => {
        console.log("Saving current report configuration...");
        alert("Save Report functionality not yet implemented.");
    };

  return (
    <div className="space-y-6">
      {/* Removed Tabs navigation */}
      <div className="flex items-center justify-between">
         {/* Title is now managed by AppLayout */}
         <div className="flex-1"></div> {/* Spacer to push buttons to the right */}
         <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={handleLoadReport} className="border-input hover:bg-accent hover:text-accent-foreground">Cargar Reporte Guardado</Button>
           <Button size="sm" className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSaveReport}><Save className="h-3.5 w-3.5"/> Guardar Reporte</Button>
         </div>
      </div>


      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Constructor de Reportes Personalizados</CardTitle>
          <CardDescription className="text-muted-foreground">Selecciona fuentes de datos, campos, filtros y opciones de agrupación.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4">
             <h3 className="font-semibold text-lg text-foreground">1. Datos y Campos</h3>
              <div className="space-y-2">
                 <Label htmlFor="dataSource" className="text-muted-foreground">Fuente de Datos</Label>
                 <Select>
                  <SelectTrigger id="dataSource" className="bg-background border-input text-foreground">
                    <SelectValue placeholder="Seleccionar fuente de datos..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground border-border">
                     <SelectGroup>
                       <SelectLabel className="text-muted-foreground">Activos</SelectLabel>
                       <SelectItem value="asset_list">Lista de Activos</SelectItem>
                       <SelectItem value="asset_history">Historial de Activos</SelectItem>
                    </SelectGroup>
                     <SelectGroup>
                       <SelectLabel className="text-muted-foreground">Clientes</SelectLabel>
                       <SelectItem value="client_dir">Directorio de Clientes</SelectItem>
                       <SelectItem value="client_comm">Comunicaciones con Clientes</SelectItem>
                     </SelectGroup>
                     <SelectGroup>
                       <SelectLabel className="text-muted-foreground">Inventario</SelectLabel>
                       <SelectItem value="inv_stock">Niveles de Stock</SelectItem>
                       <SelectItem value="inv_move">Movimientos de Stock</SelectItem>
                    </SelectGroup>
                     <SelectGroup>
                       <SelectLabel className="text-muted-foreground">Servicios</SelectLabel>
                       <SelectItem value="svc_tickets">Tickets de Servicio</SelectItem>
                       <SelectItem value="svc_catalog">Catálogo de Servicios</SelectItem>
                     </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Card className="p-4 bg-muted/30 border-border max-h-60 overflow-y-auto">
                <p className="text-sm font-medium mb-2 text-foreground">Campos Disponibles (Ejemplo: Lista de Activos)</p>
                <div className="space-y-2">
                    {['ID Activo', 'Nombre', 'Categoría', 'Estado', 'Ubicación', 'Asignado A', 'Fecha Compra', 'Fin Garantía', 'Nº Serie', 'Costo'].map(field => (
                        <div key={field} className="flex items-center space-x-2">
                            <Checkbox id={`field-${field}`} className="border-primary"/>
                            <Label htmlFor={`field-${field}`} className="text-sm font-normal text-foreground">{field}</Label>
                        </div>
                    ))}
                </div>
              </Card>
          </div>

          <div className="space-y-4">
             <h3 className="font-semibold text-lg text-foreground">2. Filtros</h3>
             <div className="flex items-end gap-2 p-3 border border-border rounded-md bg-muted/30">
                <div className="flex-1 space-y-1">
                    <Label htmlFor="filter-field-1" className="text-xs text-muted-foreground">Campo</Label>
                    <Select>
                        <SelectTrigger id="filter-field-1" className="h-8 text-xs bg-background border-input text-foreground">
                            <SelectValue placeholder="Seleccionar campo..." />
                        </SelectTrigger>
                         <SelectContent className="bg-popover text-popover-foreground border-border">
                            <SelectItem value="status">Estado</SelectItem>
                            <SelectItem value="category">Categoría</SelectItem>
                            <SelectItem value="purchase_date">Fecha Compra</SelectItem>
                         </SelectContent>
                    </Select>
                </div>
                 <div className="flex-1 space-y-1">
                    <Label htmlFor="filter-op-1" className="text-xs text-muted-foreground">Operador</Label>
                    <Select>
                        <SelectTrigger id="filter-op-1" className="h-8 text-xs bg-background border-input text-foreground">
                            <SelectValue placeholder="Operador..." />
                        </SelectTrigger>
                         <SelectContent className="bg-popover text-popover-foreground border-border">
                             <SelectItem value="eq">Igual a</SelectItem>
                             <SelectItem value="neq">No Igual a</SelectItem>
                             <SelectItem value="gt">Mayor que</SelectItem>
                             <SelectItem value="lt">Menor que</SelectItem>
                             <SelectItem value="contains">Contiene</SelectItem>
                             <SelectItem value="in">En Lista</SelectItem>
                         </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 space-y-1">
                     <Label htmlFor="filter-value-1" className="text-xs text-muted-foreground">Valor</Label>
                    <Input id="filter-value-1" placeholder="Ingresar valor" className="h-8 text-xs bg-background border-input text-foreground placeholder:text-muted-foreground"/>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
             </div>
             <Button variant="outline" size="sm" className="gap-1 w-full border-input hover:bg-accent hover:text-accent-foreground">
                <PlusCircle className="h-4 w-4" /> Añadir Condición de Filtro
             </Button>
          </div>

            <div className="space-y-4">
             <h3 className="font-semibold text-lg text-foreground">3. Agrupación y Orden</h3>
               <div className="space-y-2">
                 <Label htmlFor="grouping" className="text-muted-foreground">Agrupar Por (Opcional)</Label>
                 <Select>
                  <SelectTrigger id="grouping" className="bg-background border-input text-foreground">
                    <SelectValue placeholder="Seleccionar campo para agrupar..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground border-border">
                     <SelectItem value="none">Ninguno</SelectItem>
                     <SelectItem value="category">Categoría</SelectItem>
                     <SelectItem value="location">Ubicación</SelectItem>
                     <SelectItem value="status">Estado</SelectItem>
                     <SelectItem value="assigned_to">Asignado A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                 <Label className="text-muted-foreground">Ordenar Por (Opcional)</Label>
                 <div className="flex items-center gap-2 p-3 border border-border rounded-md bg-muted/30">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move"/>
                    <Select>
                        <SelectTrigger className="h-8 text-xs flex-1 bg-background border-input text-foreground">
                            <SelectValue placeholder="Seleccionar campo..." />
                        </SelectTrigger>
                         <SelectContent className="bg-popover text-popover-foreground border-border">
                            <SelectItem value="name">Nombre</SelectItem>
                            <SelectItem value="purchase_date">Fecha Compra</SelectItem>
                            <SelectItem value="cost">Costo</SelectItem>
                            <SelectItem value="asset_id">ID Activo</SelectItem>
                         </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger className="h-8 text-xs w-[100px] bg-background border-input text-foreground">
                            <SelectValue placeholder="Orden..." />
                        </SelectTrigger>
                         <SelectContent className="bg-popover text-popover-foreground border-border">
                            <SelectItem value="asc">Ascendente</SelectItem>
                            <SelectItem value="desc">Descendente</SelectItem>
                         </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive">
                       <Trash2 className="h-4 w-4" />
                    </Button>
                 </div>
                 <Button variant="outline" size="sm" className="gap-1 w-full border-input hover:bg-accent hover:text-accent-foreground">
                    <PlusCircle className="h-4 w-4" /> Añadir Campo de Orden
                 </Button>
              </div>
          </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t border-border pt-6">
            <Button variant="outline" onClick={handlePreviewReport} className="gap-1 border-input hover:bg-accent hover:text-accent-foreground"><Eye className="h-4 w-4"/> Vista Previa</Button>
            <Button onClick={handleGenerateExport} className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"><FileCog className="h-4 w-4"/> Generar y Exportar</Button>
        </CardFooter>
      </Card>


      <p className="text-sm text-muted-foreground">
        Capacidades de generación de reportes definidos por el usuario. Esto requiere lógica de backend significativa para la consulta y agregación de datos. Se aplican registros de auditoría y acceso basado en roles.
      </p>
    </div>
  );
}
