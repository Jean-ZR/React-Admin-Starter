import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Sample data structure matching the requested Asset management grid (subset)
const sampleData = [
  { id: 'ASSET001', name: 'Laptop Pro 15"', category: 'Electronics', status: 'Active', location: 'Office A', assignedTo: 'John Doe', purchaseDate: '2023-01-15' },
  { id: 'ASSET002', name: 'Office Chair Ergonomic', category: 'Furniture', status: 'Active', location: 'Office B', assignedTo: 'Jane Smith', purchaseDate: '2023-02-20' },
  { id: 'ASSET003', name: 'Monitor UltraWide', category: 'Electronics', status: 'In Repair', location: 'IT Department', assignedTo: '', purchaseDate: '2022-11-01' },
  { id: 'ASSET004', name: 'Standing Desk', category: 'Furniture', status: 'Active', location: 'Office A', assignedTo: 'John Doe', purchaseDate: '2023-01-15' },
  { id: 'ASSET005', name: 'Projector HD', category: 'Electronics', status: 'Inactive', location: 'Storage', assignedTo: '', purchaseDate: '2021-05-10' },
  { id: 'ASSET006', name: 'Keyboard Mechanical', category: 'Electronics', status: 'Active', location: 'Office C', assignedTo: 'Peter Jones', purchaseDate: '2023-06-01' },
  { id: 'ASSET007', name: 'Whiteboard Large', category: 'Office Supplies', status: 'Active', location: 'Meeting Room 1', assignedTo: '', purchaseDate: '2022-08-30' },
];

export function SampleDataGrid() {
  return (
    <div className="overflow-hidden rounded-lg border shadow-sm">
      <Table>
        <TableCaption>A sample list of assets. (Read-only demonstration)</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Asset ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead className="text-right">Purchase Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sampleData.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>
                <Badge variant={item.status === 'Active' ? 'default' : item.status === 'In Repair' ? 'secondary' : 'outline'}
                       className={item.status === 'Active' ? 'bg-accent text-accent-foreground' : item.status === 'In Repair' ? '' : 'text-muted-foreground'}>
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell>{item.location}</TableCell>
              <TableCell>{item.assignedTo || 'N/A'}</TableCell>
              <TableCell className="text-right">{item.purchaseDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
