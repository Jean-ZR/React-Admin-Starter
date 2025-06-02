
'use client';

import React from 'react';
import { Badge } from "@/components/ui/badge";

interface InvoiceStatusBadgeProps {
  status: string;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  let variant: "default" | "secondary" | "outline" | "destructive" = "outline";
  let className = "text-muted-foreground border-border";

  switch (status?.toLowerCase()) {
    case 'borrador': // Draft
      variant = 'outline';
      className = 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600';
      break;
    case 'enviada': // Sent
      variant = 'secondary';
      className = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      break;
    case 'pagada': // Paid
      variant = 'default';
      className = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700';
      break;
    case 'vencida': // Overdue
      variant = 'destructive';
      className = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      break;
    case 'cancelada': // Cancelled
      variant = 'destructive';
      className = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700 line-through';
      break;
    default:
      break;
  }

  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}
