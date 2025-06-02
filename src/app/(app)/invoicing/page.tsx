
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InvoicingRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/invoicing/list');
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <p>Redirigiendo a la lista de facturas...</p>
    </div>
  );
}
