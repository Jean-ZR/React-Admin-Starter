
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ticket, MessageSquare, FileText } from "lucide-react";
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePathname } from 'next/navigation';

export default function ClientPortalPage() {
  const pathname = usePathname();
  return (
    <div className="space-y-6">
      <Tabs defaultValue={pathname} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card border-b-0 mb-4 rounded-lg">
          <TabsTrigger value="/clients/directory" asChild className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground data-[state=active]:shadow-sm hover:bg-muted/50">
            <Link href="/clients/directory">Directorio</Link>
          </TabsTrigger>
          <TabsTrigger value="/clients/portal" asChild className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground data-[state=active]:shadow-sm hover:bg-muted/50">
            <Link href="/clients/portal">Portal</Link>
          </TabsTrigger>
          <TabsTrigger value="/clients/history" asChild className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground data-[state=active]:shadow-sm hover:bg-muted/50">
            <Link href="/clients/history">Historial</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <h1 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
        Portal del Cliente
      </h1>
      <p className="text-muted-foreground">Interfaz para interacciones con el cliente y solicitudes de servicio.</p>

       <Card className="bg-card text-card-foreground border-border">
         <CardHeader>
           <CardTitle className="text-foreground">¡Bienvenido, Nombre del Cliente!</CardTitle> {/* Dynamically set */}
           <CardDescription className="text-muted-foreground">Accede a tus servicios y solicitudes de soporte aquí.</CardDescription>
         </CardHeader>
         <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="flex flex-col items-center justify-center p-6 text-center bg-background border-border">
                <Ticket className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">Enviar Nueva Solicitud</h3>
                <p className="text-sm text-muted-foreground mb-4">¿Necesitas ayuda? Abre un nuevo ticket de servicio.</p>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Crear Ticket</Button>
            </Card>
             <Card className="flex flex-col items-center justify-center p-6 text-center bg-background border-border">
                <MessageSquare className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">Ver Tickets Abiertos</h3>
                <p className="text-sm text-muted-foreground mb-4">Consulta el estado de tus solicitudes en curso.</p>
                 <Button size="sm" variant="outline" className="border-input hover:bg-accent hover:text-accent-foreground">Ver Tickets</Button>
             </Card>
              <Card className="flex flex-col items-center justify-center p-6 text-center bg-background border-border">
                <FileText className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">Base de Conocimiento</h3>
                <p className="text-sm text-muted-foreground mb-4">Encuentra respuestas y guías en nuestro centro de ayuda.</p>
                <Button size="sm" variant="outline" className="border-input hover:bg-accent hover:text-accent-foreground">Explorar Artículos</Button>
              </Card>
         </CardContent>
       </Card>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Enviar una Solicitud de Servicio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="grid gap-2">
              <label htmlFor="request-type" className="text-sm font-medium text-muted-foreground">Tipo de Solicitud</label>
             <Select>
              <SelectTrigger id="request-type" className="bg-background border-input text-foreground">
                <SelectValue placeholder="Seleccionar tipo de servicio" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                <SelectItem value="support">Soporte Técnico</SelectItem>
                <SelectItem value="billing">Consulta de Facturación</SelectItem>
                <SelectItem value="maintenance">Solicitud de Mantenimiento</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
           </div>
           <div className="grid gap-2">
             <label htmlFor="subject" className="text-sm font-medium text-muted-foreground">Asunto</label>
             <Input id="subject" placeholder="Describe brevemente el problema" className="bg-background border-input text-foreground placeholder:text-muted-foreground"/>
           </div>
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium text-muted-foreground">Descripción</label>
            <Textarea id="description" placeholder="Proporciona detalles sobre tu solicitud" rows={5} className="bg-background border-input text-foreground placeholder:text-muted-foreground"/>
          </div>
          <div className="flex justify-end">
             <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Enviar Solicitud</Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Esta página simula el portal orientado al cliente. El acceso basado en roles asegura que los clientes solo vean su propia información. Los registros de auditoría rastrean las interacciones.
      </p>
    </div>
  );
}

    