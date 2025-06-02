
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/auth-context';
import { getPageTitleInfo } from '@/lib/translations';
import { usePathname } from 'next/navigation';
import { Construction } from 'lucide-react';

export default function CreateInvoicePage() {
  const { languagePreference } = useAuth();
  const pathname = usePathname();
  // const currentPageInfo = getPageTitleInfo(languagePreference, pathname); // Title is now handled by AppLayout

  return (
    <div className="space-y-6">
      {/* Page title is handled by AppLayout */}
      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Crear Nueva Factura</CardTitle>
          <CardDescription className="text-muted-foreground">
            Esta sección está en desarrollo. Aquí podrás generar nuevas facturas para tus clientes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <Construction className="h-16 w-16 text-primary mb-4" />
          <p className="text-lg font-semibold text-foreground">Funcionalidad Próximamente</p>
          <p className="text-muted-foreground">
            Estamos trabajando para implementar el formulario de creación de facturas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
