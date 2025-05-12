import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, MessageSquare, FileText, DollarSign } from "lucide-react"; // Added DollarSign import
// import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"; // Assuming this component exists

const history = [
  { id: 'HIST001', date: '2024-07-15', type: 'Service Request', description: 'Opened ticket #SRV1023 - Network issue', client: 'Alpha Corp', status: 'Closed' },
  { id: 'HIST002', date: '2024-07-10', type: 'Communication', description: 'Email sent regarding invoice #INV500', client: 'Beta Industries', status: 'Sent' },
  { id: 'HIST003', date: '2024-07-05', type: 'Transaction', description: 'Payment received for invoice #INV490', client: 'Alpha Corp', status: 'Completed' },
  { id: 'HIST004', date: '2024-06-28', type: 'Service Request', description: 'Opened ticket #SRV1020 - Software install', client: 'Gamma Solutions', status: 'In Progress' },
  { id: 'HIST005', date: '2024-06-20', type: 'Communication', description: 'Phone call follow-up on project proposal', client: 'Beta Industries', status: 'Logged' },
];

export default function ClientHistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">
          Client History
        </h1>
        <div className="flex gap-2 items-center w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search history..."
              className="pl-8 sm:w-[300px]"
            />
          </div>
          <Button size="sm">Export</Button>
        </div>
      </div>

      {/* Filters */}
       <Card>
         <CardHeader>
            <CardTitle>Filter History</CardTitle>
         </CardHeader>
         <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <div>
              <label htmlFor="client-filter" className="text-sm font-medium mb-1 block">Client</label>
              <Select>
                <SelectTrigger id="client-filter">
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">All Clients</SelectItem>
                   <SelectItem value="CLI001">Alpha Corp</SelectItem>
                   <SelectItem value="CLI002">Beta Industries</SelectItem>
                   <SelectItem value="CLI003">Gamma Solutions</SelectItem>
                   <SelectItem value="CLI004">Delta Services</SelectItem>
                </SelectContent>
              </Select>
           </div>
            <div>
              <label htmlFor="type-filter" className="text-sm font-medium mb-1 block">Type</label>
              <Select>
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">All Types</SelectItem>
                   <SelectItem value="service">Service Request</SelectItem>
                   <SelectItem value="comm">Communication</SelectItem>
                   <SelectItem value="trans">Transaction</SelectItem>
                </SelectContent>
              </Select>
           </div>
           {/* <div>
              <label htmlFor="date-range-filter" className="text-sm font-medium mb-1 block">Date Range</label>
             <DatePickerWithRange id="date-range-filter" />
           </div> */}
           <div className="flex items-end">
             <Button className="w-full lg:w-auto">Apply Filters</Button>
           </div>
         </CardContent>
       </Card>

      <Card>
         <CardHeader>
          <CardTitle>Interaction Log</CardTitle>
           <CardDescription>Track client-related transactions and communications.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{item.date}</TableCell>
                  <TableCell className="font-medium">{item.client}</TableCell>
                  <TableCell>
                     <Badge variant="secondary" className="gap-1 items-center">
                        {item.type === 'Service Request' && <MessageSquare className="h-3 w-3"/>}
                        {item.type === 'Communication' && <FileText className="h-3 w-3"/>}
                         {item.type === 'Transaction' && <DollarSign className="h-3 w-3"/>}
                         {item.type}
                     </Badge>
                  </TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                     <Badge variant={item.status === 'Closed' || item.status === 'Completed' ? 'default' : 'outline'}
                            className={item.status === 'Closed' || item.status === 'Completed' ? 'bg-accent text-accent-foreground' : ''}>
                       {item.status}
                     </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      <p className="text-sm text-muted-foreground">
        Track client-related transactions and communications with search and filtering. Audit logs and role-based access are applied.
      </p>
    </div>
  );
}
