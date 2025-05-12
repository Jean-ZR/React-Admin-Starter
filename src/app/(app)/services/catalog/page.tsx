import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Search, Tag, Clock, DollarSign, PlusCircle, Settings } from "lucide-react";

const services = [
  { id: 'SVC001', name: 'Standard IT Support', category: 'Support', description: 'General troubleshooting for hardware and software issues.', price: '$50/hr', sla: '4 hours response' },
  { id: 'SVC002', name: 'Network Setup', category: 'Installation', description: 'Configuration of routers, switches, and Wi-Fi networks.', price: '$250 fixed', sla: 'Next Business Day' },
  { id: 'SVC003', name: 'Server Maintenance', category: 'Maintenance', description: 'Monthly checkups, updates, and performance tuning for servers.', price: '$150/month per server', sla: 'Scheduled Monthly' },
  { id: 'SVC004', name: 'Cloud Migration', category: 'Consulting', description: 'Planning and execution of migrating services to the cloud.', price: 'Quote Based', sla: 'Project Dependant' },
];

export default function ServiceCatalogPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">
          Service Catalog
        </h1>
        <div className="flex gap-2 items-center w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search services..."
              className="pl-8 sm:w-[300px]"
            />
          </div>
          <Button size="sm" className="h-9 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Add Service</span>
          </Button>
          <Button size="sm" variant="outline" className="h-9 gap-1">
            <Tag className="h-3.5 w-3.5" />
             <span className="sr-only sm:not-sr-only">Manage Categories</span>
          </Button>
        </div>
      </div>

       <Card>
         <CardHeader>
           <CardTitle>Available Services</CardTitle>
           <CardDescription>List of services offered with descriptions, pricing, and SLAs.</CardDescription>
         </CardHeader>
         <CardContent>
           <Accordion type="single" collapsible className="w-full">
             {services.map((service) => (
              <AccordionItem value={`item-${service.id}`} key={service.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex justify-between items-center w-full pr-4">
                     <span className="font-medium">{service.name}</span>
                      <Badge variant="secondary">{service.category}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4 text-muted-foreground">{service.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                     <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-4 w-4" /> Price: <span className="font-medium text-foreground">{service.price}</span>
                     </div>
                     <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" /> SLA: <span className="font-medium text-foreground">{service.sla}</span>
                     </div>
                  </div>
                   <div className="mt-4 flex justify-end">
                     <Button size="sm" variant="ghost" className="gap-1">
                       <Settings className="h-3 w-3"/> Edit Service
                     </Button>
                   </div>
                </AccordionContent>
              </AccordionItem>
             ))}
           </Accordion>
         </CardContent>
         <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>{services.length}</strong> services.
            </div>
         </CardFooter>
       </Card>

       <p className="text-sm text-muted-foreground">
         Manage the list of available services. Audit logs and role-based access are applied.
       </p>
     </div>
  );
}
