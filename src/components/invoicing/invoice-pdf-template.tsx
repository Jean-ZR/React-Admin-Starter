// src/components/invoicing/invoice-pdf-template.tsx
'use client';
import React from 'react';

interface Item {
  item: {
    internal_id?: string;
    description: string;
    unit_type_id?: string;
  };
  quantity: number;
  unit_price: number;
  total: number;
}

interface Legend {
  code: string;
  value: string;
}

interface Payment {
  payment_method_type?: { description?: string };
  payment: number;
  change: number;
}

interface DocumentData {
  document: {
    series: string;
    number: number;
    date_of_issue: Date | string;
    time_of_issue: string;
    state_type: { id: string };
    document_type: { description: string };
    total: number;
    total_igv: number;
    total_taxed: number;
    currency_type: { symbol: string; description: string };
    hash?: string;
    qr?: string;
    items: Item[];
    legends: Legend[];
    additional_information: string[];
    payment_condition_id: string;
    payments: Payment[];
  };
  company: {
    name: string;
    number: string; // RUC
    logo?: string | null;
  };
  establishment: {
    address: string;
    district?: { description?: string };
    province?: { description?: string };
    department?: { description?: string };
    telephone?: string;
    email?: string;
  };
  customer: {
    name: string;
    number: string; // RUC/DNI
    address?: string;
    identity_document_type: { description: string };
    district?: { description?: string };
    province?: { description?: string };
    department?: { description?: string };
  };
  invoice?: { // For credit notes/debit notes, etc.
    date_of_due?: Date | string;
  } | null;
  document_base?: any | null; // For credit/debit notes
  accounts?: any[]; // Bank accounts, etc.
}

interface InvoiceTemplateProps {
  documentData?: Partial<DocumentData>; // Make it partial to allow merging with mock
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ documentData = {} }) => {
  // Mock data para demostración - reemplaza con tus datos reales
  const mockData: DocumentData = {
    document: {
      series: 'F001',
      number: 123,
      date_of_issue: new Date(),
      time_of_issue: '10:30:00',
      state_type: { id: '01' }, // '01' Activo, '11' Anulado
      document_type: { description: 'FACTURA ELECTRÓNICA' },
      total: 1000.00,
      total_igv: 180.00,
      total_taxed: 820.00,
      currency_type: { symbol: 'S/', description: 'SOLES' },
      hash: 'ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG123',
      qr: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', // Placeholder small transparent PNG
      items: [
        {
          item: { internal_id: 'PROD001', description: 'Producto de ejemplo 1', unit_type_id: 'NIU' },
          quantity: 2,
          unit_price: 410.00,
          total: 820.00
        },
        {
          item: { internal_id: 'SERV002', description: 'Servicio de Consultoría X', unit_type_id: 'ZZ' },
          quantity: 10,
          unit_price: 18.00, // Assuming total_taxed 820 + 180 for IGV makes total 1000. So (1000-820)/1.18 if this service is also taxed
          // Let's adjust for simplicity: total_igv comes from document.total - document.total_taxed
          // So, if only the first item is taxed, then total_igv = 820 * 0.18 = 147.6. The mock data implies total_igv is based on overall.
          // Let's assume the items passed already have correct totals.
          total: 0 // This should be calculated or provided if items are mixed
        }
      ],
      legends: [
        { code: '1000', value: 'MIL CON 00/100' }
      ],
      additional_information: ['Información adicional del documento de prueba.'],
      payment_condition_id: '01', // '01' Contado, '02' Credito
      payments: []
    },
    company: {
      name: 'MI EMPRESA S.A.C.',
      number: '20123456789',
      logo: null // 'https://placehold.co/150x50.png?text=MiLogo' // Placeholder logo URL
    },
    establishment: {
      address: 'Av. Principal 123, Urb. Empresarial',
      district: { description: 'Lima' },
      province: { description: 'Lima' },
      department: { description: 'Lima' },
      telephone: '01-234-5678 ext. 101',
      email: 'contacto@miempresa.com'
    },
    customer: {
      name: 'Cliente Ejemplo S.R.L.',
      number: '20987654321', // Example RUC
      address: 'Jr. Cliente 456, Oficina 201',
      identity_document_type: { description: 'RUC' }, // Could be DNI, etc.
      district: { description: 'San Isidro' },
      province: { description: 'Lima' },
      department: { description: 'Lima' }
    },
    invoice: { // Example for date_of_due if payment condition is credit
        date_of_due: new Date(new Date().setDate(new Date().getDate() + 30))
    }, 
    document_base: null,
    accounts: []
  };

  // Deep merge documentData into mockData, especially for nested objects
  const mergeDeep = (target: any, source: any) => {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target))
            Object.assign(output, { [key]: source[key] });
          else
            output[key] = mergeDeep(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  };
  
  const isObject = (item: any) => {
    return (item && typeof item === 'object' && !Array.isArray(item));
  };

  const data: DocumentData = mergeDeep(mockData, documentData);
  
  const documentNumber = `${data.document.series}-${String(data.document.number).padStart(8, '0')}`;
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return `${data.document.currency_type.symbol} 0.00`;
    return `${data.document.currency_type.symbol} ${Number(amount).toFixed(2)}`;
  }
  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return 'N/A';
    try {
      const d = (date instanceof Date) ? date : new Date(date);
      if (isNaN(d.getTime())) return 'Invalid Date'; // Check if date is valid
      return d.toISOString().split('T')[0];
    } catch (e) {
        return 'Invalid Date';
    }
  };

  return (
    // A4 size: 210mm x 297mm. Tailwind classes for approximation.
    // Using max-w-4xl (896px) which is wider than A4 portrait.
    // Typical A4 at 96dpi is ~794px wide. Let's use a more contained width for screen.
    // For html2canvas, the actual rendered size matters.
    <div className="w-[210mm] min-h-[297mm] bg-white p-[15mm] text-[10px] leading-normal font-sans text-black" style={{ fontFamily: 'Arial, sans-serif'}}>
      {/* Marca de agua para documentos anulados */}
      {data.document.state_type.id === '11' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="text-red-500 text-7xl font-bold opacity-20 rotate-[-30deg] tracking-wider" style={{ letterSpacing: '0.1em'}}>
            ANULADO
          </div>
        </div>
      )}

      {/* Encabezado */}
      <table className="w-full mb-4 border-collapse">
        <tbody>
          <tr>
            <td className="w-[30%] align-top pr-2">
              {data.company.logo && (
                <img 
                  src={data.company.logo} 
                  alt={data.company.name}
                  className="max-w-full h-auto max-h-[60px] object-contain"
                />
              )}
            </td>
            <td className="w-[40%] align-top px-2">
              <h4 className="font-bold text-base leading-tight">{data.company.name}</h4>
              <h5 className="font-medium text-xs leading-tight">RUC {data.company.number}</h5>
              <div className="text-[8px] mt-0.5 leading-snug uppercase">
                {data.establishment.address}
                {data.establishment.district && `, ${data.establishment.district.description}`}
                {data.establishment.province && `, ${data.establishment.province.description}`}
                {data.establishment.department && `- ${data.establishment.department.description}`}
              </div>
              {data.establishment.telephone && (
                <div className="text-[8px] leading-snug">Central telefónica: {data.establishment.telephone}</div>
              )}
              {data.establishment.email && (
                <div className="text-[8px] leading-snug">Email: {data.establishment.email}</div>
              )}
            </td>
            <td className="w-[30%] align-top pl-2">
              <div className="border-2 border-black p-2 text-center h-full flex flex-col justify-center">
                <h3 className="font-bold text-sm leading-tight">R.U.C. {data.company.number}</h3>
                <h5 className="text-center my-1 text-sm font-semibold leading-tight">{data.document.document_type.description}</h5>
                <h3 className="text-center font-bold text-sm leading-tight">{documentNumber}</h3>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Información del documento */}
      <div className="mb-4">
        <table className="w-full text-[9px] border-collapse">
          <tbody>
            <tr>
              <td className="font-semibold w-[25%] py-0.5 pr-1 align-top">FECHA DE EMISIÓN</td>
              <td className="w-[2%] py-0.5 pr-1 align-top">:</td>
              <td className="w-[73%] py-0.5 align-top">{formatDate(data.document.date_of_issue)} / {data.document.time_of_issue}</td>
            </tr>
            {data.invoice?.date_of_due && data.document.payment_condition_id !== '01' && (
              <tr>
                <td className="font-semibold py-0.5 pr-1 align-top">FECHA DE VENCIMIENTO</td>
                <td className="py-0.5 pr-1 align-top">:</td>
                <td className="py-0.5 align-top">{formatDate(data.invoice.date_of_due)}</td>
              </tr>
            )}
            <tr>
              <td className="font-semibold py-0.5 pr-1 align-top">CLIENTE</td>
              <td className="py-0.5 pr-1 align-top">:</td>
              <td className="py-0.5 align-top">{data.customer.name}</td>
            </tr>
            <tr>
              <td className="font-semibold py-0.5 pr-1 align-top">{data.customer.identity_document_type.description}</td>
              <td className="py-0.5 pr-1 align-top">:</td>
              <td className="py-0.5 align-top">{data.customer.number}</td>
            </tr>
            {data.customer.address && (
              <tr>
                <td className="font-semibold py-0.5 pr-1 align-top">DIRECCIÓN</td>
                <td className="py-0.5 pr-1 align-top">:</td>
                <td className="uppercase py-0.5 align-top">
                  {data.customer.address}
                  {data.customer.district && `, ${data.customer.district.description}`}
                  {data.customer.province && `, ${data.customer.province.description}`}
                  {data.customer.department && `- ${data.customer.department.description}`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tabla de items */}
      <div className="mb-4">
        <table className="w-full border-collapse text-[9px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-400 text-center py-1 px-1 w-[10%] font-semibold">COD.</th>
              <th className="border border-gray-400 text-center py-1 px-1 w-[10%] font-semibold">CANT.</th>
              <th className="border border-gray-400 text-center py-1 px-1 w-[10%] font-semibold">UNIDAD</th>
              <th className="border border-gray-400 text-left py-1 px-1 font-semibold">DESCRIPCIÓN</th>
              <th className="border border-gray-400 text-right py-1 px-1 w-[12%] font-semibold">P.UNIT</th>
              <th className="border border-gray-400 text-right py-1 px-1 w-[8%] font-semibold">DTO.</th>
              <th className="border border-gray-400 text-right py-1 px-1 w-[15%] font-semibold">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {data.document.items.map((row, index) => (
              <tr key={index}>
                <td className="border border-gray-300 text-center align-top py-1 px-1">{row.item.internal_id || '-'}</td>
                <td className="border border-gray-300 text-center align-top py-1 px-1">
                  {Number.isInteger(row.quantity) ? row.quantity : row.quantity.toFixed(2)}
                </td>
                <td className="border border-gray-300 text-center align-top py-1 px-1">{row.item.unit_type_id || 'NIU'}</td>
                <td className="border border-gray-300 text-left align-top py-1 px-1">
                  <div dangerouslySetInnerHTML={{ __html: row.item.description }} />
                </td>
                <td className="border border-gray-300 text-right align-top py-1 px-1">{formatCurrency(row.unit_price)}</td>
                <td className="border border-gray-300 text-right align-top py-1 px-1">{formatCurrency(0)}</td> {/* Placeholder for discount */}
                <td className="border border-gray-300 text-right align-top py-1 px-1">{formatCurrency(row.total)}</td>
              </tr>
            ))}
            
            {/* Fill empty rows if less than, e.g., 10 items */}
            {Array.from({ length: Math.max(0, 10 - data.document.items.length) }).map((_, i) => (
                <tr key={`empty-${i}`}>
                    <td className="border border-gray-300 py-1 px-1 h-[20px]">&nbsp;</td>
                    <td className="border border-gray-300 py-1 px-1">&nbsp;</td>
                    <td className="border border-gray-300 py-1 px-1">&nbsp;</td>
                    <td className="border border-gray-300 py-1 px-1">&nbsp;</td>
                    <td className="border border-gray-300 py-1 px-1">&nbsp;</td>
                    <td className="border border-gray-300 py-1 px-1">&nbsp;</td>
                    <td className="border border-gray-300 py-1 px-1">&nbsp;</td>
                </tr>
            ))}
          </tbody>
        </table>
        
        {/* Totales Section */}
        <table className="w-full mt-[-1px] border-collapse text-[9px]">
            <tbody>
                {data.document.total_taxed > 0 && (
                <tr>
                    <td className="w-[75%] text-right py-1 px-1 border border-gray-300 font-semibold">OP. GRAVADAS: {data.document.currency_type.symbol}</td>
                    <td className="w-[25%] text-right py-1 px-1 border border-gray-300">{formatCurrency(data.document.total_taxed)}</td>
                </tr>
                )}
                {/* Add other operations like Inafectas, Exoneradas if needed */}
                <tr>
                    <td className="text-right py-1 px-1 border border-gray-300 font-semibold">IGV: {data.document.currency_type.symbol}</td>
                    <td className="text-right py-1 px-1 border border-gray-300">{formatCurrency(data.document.total_igv)}</td>
                </tr>
                <tr>
                    <td className="text-right py-1 px-1 border border-gray-300 font-bold text-xs">TOTAL A PAGAR: {data.document.currency_type.symbol}</td>
                    <td className="text-right py-1 px-1 border border-gray-300 font-bold text-xs">{formatCurrency(data.document.total)}</td>
                </tr>
            </tbody>
        </table>
      </div>

      {/* Pie del documento */}
      <table className="w-full text-[9px] border-collapse mt-2">
        <tbody>
          <tr>
            <td className="w-[65%] align-top pr-2">
              {/* Leyendas */}
              {data.document.legends.map((legend, index) => (
                <div key={index} className="mb-0.5">
                  {legend.code === "1000" ? (
                    <p className="uppercase text-[8px]">
                      SON: <span className="font-bold">{legend.value} {data.document.currency_type.description}</span>
                    </p>
                  ) : (
                    <p className="text-[8px]">{legend.code}: {legend.value}</p>
                  )}
                </div>
              ))}

              {/* Información adicional */}
              {data.document.additional_information.length > 0 && (
                <div className="mt-1">
                  <strong className="text-[8px]">Información adicional:</strong>
                  {data.document.additional_information.map((info, index) => (
                    <p key={index} className="text-[8px]">{info}</p>
                  ))}
                </div>
              )}
            </td>
            <td className="w-[35%] align-top text-center pl-2">
              {data.document.qr && (
                <img 
                  src={`data:image/png;base64,${data.document.qr}`} 
                  alt="QR Code"
                  className="mx-auto mb-1 w-[80px] h-[80px]" // Fixed size for QR
                />
              )}
              {data.document.hash && <p className="text-[7px] break-all">Código Hash: {data.document.hash}</p>}
            </td>
          </tr>
        </tbody>
      </table>
      
      {/* Condición de pago */}
      <div className="mt-2 text-[9px]">
        <p><strong>CONDICIÓN DE PAGO: {data.document.payment_condition_id === '01' ? 'CONTADO' : 'CRÉDITO'}</strong></p>
      </div>

      {/* Pagos (if Contado and payments exist) */}
      {data.document.payment_condition_id === '01' && data.document.payments && data.document.payments.length > 0 && (
        <div className="mt-1 text-[9px]">
          <p><strong>PAGOS:</strong></p>
          {data.document.payments.map((payment, index) => (
            <p key={index} className="text-[8px]">
              • {payment.payment_method_type?.description || 'Pago'} - {formatCurrency(payment.payment + (payment.change || 0))}
            </p>
          ))}
        </div>
      )}

      <div className="mt-4 text-center text-[8px] text-gray-500">
        Representación impresa de la {data.document.document_type.description}. Consulte el documento electrónico en nuestro portal.
      </div>
    </div>
  );
};

export default InvoiceTemplate;
