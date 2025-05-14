
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from '@/hooks/use-toast'; // Assuming useToast is available

// Basic CSV export (remains as is, user said it's operational)
export const exportToCSV = (data: any[], filename: string) => {
  console.log("Attempting to export data to CSV:", data);
  if (!data || data.length === 0) {
    toast({ title: "Export Error", description: "No data available to export for CSV.", variant: "destructive" });
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '""'); // Escape double quotes
      return `"${escaped}"`; // Quote all fields
    });
    csvRows.push(values.join(','));
  }
  const csvContent = csvRows.join('\n');

  try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", `${filename}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast({ title: "Export Successful", description: `${filename}.csv downloaded.` });
      } else {
         toast({ title: "Export Info", description: "CSV export generated. Direct download may not be fully supported in this environment.", variant: "default" });
      }
  } catch (e) {
     console.error("Error during CSV export:", e);
     toast({ title: "Export Error", description: "CSV export failed.", variant: "destructive" });
  }
};

interface PDFExportOptions {
  data: any[];
  columns: Array<{ header: string; dataKey: string }>;
  title: string;
  filename: string;
}

export const exportToPDF = (options: PDFExportOptions) => {
  const { data, columns, title, filename } = options;
  console.log(`Attempting to export data to PDF (${filename}):`, data);

  if (!data || data.length === 0) {
    toast({ title: "Export Error", description: "No data available to export for PDF.", variant: "destructive" });
    return;
  }

  try {
    const doc = new jsPDF();
    
    // Add title to the PDF
    doc.setFontSize(18);
    doc.text(title, 14, 22); // (text, x, y)

    autoTable(doc, {
      startY: 30, // Start table after the title
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => {
        // Ensure dataKey exists and handle undefined/null values
        const value = row[col.dataKey];
        return value !== undefined && value !== null ? String(value) : '';
      })),
      theme: 'striped', // or 'grid', 'plain'
      headStyles: { fillColor: [22, 160, 133] }, // Example: Teal header
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { text: { cellWidth: 'auto' } },
    });

    doc.save(filename);
    toast({ title: "Export Successful", description: `${filename} downloaded.` });
  } catch (e) {
    console.error("Error during PDF export:", e);
    toast({ title: "Export Error", description: "PDF export failed.", variant: "destructive" });
  }
};
