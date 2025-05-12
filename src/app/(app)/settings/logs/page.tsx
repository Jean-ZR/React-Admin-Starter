import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ListFilter, FileText, User, Clock, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"; // Assuming this component exists

const systemLogs = [
  { id: 'LOG001', timestamp: '2024-07-21 10:05:30', user: 'Alice Johnson', action: 'User Login', level: 'Info', details: 'Successful login from IP 192.168.1.100' },
  { id: 'LOG002', timestamp: '2024-07-21 10:06:15', user: 'Alice Johnson', action: 'Update Setting', level: 'Info', details: 'Changed application name to "Admin Pro"' },
  { id: 'LOG003', timestamp: '2024-07-21 09:50:00', user: 'System', action: 'Scheduled Task', level: 'Info', details: 'Ran low stock check - 2 items found.' },
  { id: 'LOG004', timestamp: '2024-07-20 14:35:10', user: 'Bob Williams', action: 'Create Asset', level: 'Info', details: 'Added new asset: ASSET008 - Monitor Stand' },
  { id: 'LOG005', timestamp: '2024-07-20 11:00:00', user: 'Charlie Brown', action: 'Login Attempt Failed', level: 'Warning', details: 'Failed login attempt for user charlie.b' },
  { id: 'LOG006', timestamp: '2024-07-19 16:00:00', user: 'System', action: 'API Request', level: 'Debug', details: 'Received GET /api/v1/assets' },
];

export default function SystemLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">
          System Logs
        </h1>
         <div className="flex gap-2 items-center w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search logs (user, action, details...)"
              className="pl-8 sm:w-[300px]"
            />
          </div>
           <Button size="sm" variant="outline">Export Logs</Button>
        </div>
      </div>

       {/* Filters */}
       <Card>
         <CardHeader>
            <CardTitle>Filter Logs</CardTitle>
         </CardHeader>
         <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <div>
              <label htmlFor="user-log-filter" className="text-sm font-medium mb-1 block">User</label>
               <Input id="user-log-filter" placeholder="e.g., Alice Johnson" />
           </div>
            <div>
              <label htmlFor="action-log-filter" className="text-sm font-medium mb-1 block">Action</label>
               <Input id="action-log-filter" placeholder="e.g., Login, Update" />
           </div>
            <div>
              <label htmlFor="level-log-filter" className="text-sm font-medium mb-1 block">Log Level</label>
              <Select>
                <SelectTrigger id="level-log-filter">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">All Levels</SelectItem>
                   <SelectItem value="info">Info</SelectItem>
                   <SelectItem value="warning">Warning</SelectItem>
                   <SelectItem value="error">Error</SelectItem>
                   <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
           </div>
           {/* <div>
              <label htmlFor="date-range-log-filter" className="text-sm font-medium mb-1 block">Date Range</label>
             <DatePickerWithRange id="date-range-log-filter" />
           </div> */}
           <div className="flex items-end">
             <Button className="w-full lg:w-auto">Apply Filters</Button>
           </div>
         </CardContent>
       </Card>


      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Track system activities and user actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Detailed log of system and user activities.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead><Clock className="h-4 w-4 inline-block mr-1"/> Timestamp</TableHead>
                <TableHead><User className="h-4 w-4 inline-block mr-1"/> User</TableHead>
                <TableHead><FileText className="h-4 w-4 inline-block mr-1"/> Action</TableHead>
                 <TableHead>Level</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>{log.action}</TableCell>
                   <TableCell>
                      <Badge variant={log.level === 'Warning' ? 'destructive' : log.level === 'Error' ? 'destructive' : 'secondary'}
                             className={log.level === 'Warning' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : log.level === 'Error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : '' }>
                        {log.level === 'Warning' && <AlertTriangle className="h-3 w-3 mr-1"/>}
                         {/* Add Error icon if needed */}
                        {log.level}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>1-6</strong> of <strong>{systemLogs.length}</strong> log entries.
            </div>
            {/* Add Pagination component here */}
         </CardFooter>
      </Card>

      <p className="text-sm text-muted-foreground">
        Provides detailed tracking of system activities and user actions for auditing and troubleshooting. Requires appropriate permissions to view.
      </p>
    </div>
  );
}
