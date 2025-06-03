
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react';

export default function ApiIntegrationsPage() {
  // This page is being reverted/removed as per user request.
  // Display a simple message indicating it's not in use or redirect.
  // For now, a simple message:
  return (
    <div className="space-y-6">
      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
            Página de Integraciones Desactivada
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Esta sección de configuración de integraciones API ha sido revertida según la solicitud.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            La configuración del token para APIPeru (consulta RUC/DNI) ahora se gestiona
            a través de variables de entorno (archivo `.env.local`).
          </p>
          <p className="mt-2 text-muted-foreground">
            Asegúrate de que la variable `NEXT_PUBLIC_APIPERU_TOKEN` esté correctamente configurada
            en tu archivo `.env.local` para que las funcionalidades de búsqueda de RUC/DNI operen correctamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
