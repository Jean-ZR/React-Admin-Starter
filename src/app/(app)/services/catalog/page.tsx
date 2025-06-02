
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Search, Tag, Clock, DollarSign, PlusCircle, Settings, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase/config';
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  type Timestamp,
} from 'firebase/firestore';
import { ServiceFormModal, type ServiceFormData } from '@/components/services/service-form-modal';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';

export interface Service extends ServiceFormData {
  id: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  isActive: boolean; // Ensure isActive is part of the main interface
}

export default function ServiceCatalogPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const { toast } = useToast();

  const fetchServices = useCallback(() => {
    setIsLoading(true);
    const servicesCollectionRef = collection(db, 'services');
    const q = query(servicesCollectionRef, orderBy('category'), orderBy('name'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesData = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<Service, 'id'>),
      }));
      setServices(servicesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching services:", error);
      toast({ title: "Error", description: "Could not fetch services.", variant: "destructive" });
      setIsLoading(false);
    });
    return unsubscribe;
  }, [toast]);

  useEffect(() => {
    const unsubscribe = fetchServices();
    return () => unsubscribe();
  }, [fetchServices]);

  const handleAddService = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteService = async () => {
    if (serviceToDelete) {
      try {
        await deleteDoc(doc(db, 'services', serviceToDelete.id));
        toast({ title: "Success", description: "Service deleted successfully." });
      } catch (error) {
        console.error("Error deleting service:", error);
        toast({ title: "Error", description: "Could not delete service.", variant: "destructive" });
      } finally {
        setIsDeleteDialogOpen(false);
        setServiceToDelete(null);
      }
    }
  };

  const handleSaveService = async (formData: ServiceFormData) => {
    try {
      if (editingService) {
        const serviceDocRef = doc(db, 'services', editingService.id);
        await updateDoc(serviceDocRef, { ...formData, isActive: formData.isActive !== undefined ? formData.isActive : true, updatedAt: serverTimestamp() });
        toast({ title: "Success", description: "Service updated successfully." });
      } else {
        await addDoc(collection(db, 'services'), {
          ...formData,
          isActive: formData.isActive !== undefined ? formData.isActive : true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Success", description: "Service added successfully." });
      }
      setIsModalOpen(false);
      setEditingService(null);
    } catch (error) {
      console.error("Error saving service:", error);
      toast({ title: "Error", description: "Could not save service.", variant: "destructive" });
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1"></div> {/* Spacer */}
        <div className="flex gap-2 items-center w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search services..."
              className="pl-8 sm:w-[300px] bg-background border-input text-foreground placeholder:text-muted-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button size="sm" className="h-9 gap-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddService}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Add Service</span>
          </Button>
          <Button size="sm" variant="outline" className="h-9 gap-1 text-muted-foreground hover:text-foreground border-input hover:bg-accent">
            <Tag className="h-3.5 w-3.5" />
             <span className="sr-only sm:not-sr-only">Manage Categories</span>
          </Button>
        </div>
      </div>

       <Card className="bg-card text-card-foreground border-border">
         <CardHeader>
           <CardTitle className="text-foreground">Available Services</CardTitle>
           <CardDescription className="text-muted-foreground">List of services offered with descriptions, pricing, and SLAs.</CardDescription>
         </CardHeader>
         <CardContent>
           {isLoading ? (
             <div className="flex justify-center items-center min-h-[200px]">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
               <p className="ml-2 text-muted-foreground">Loading services...</p>
             </div>
           ) : filteredServices.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">
               No services found{searchTerm ? ' matching your search.' : '. Click "Add Service" to create one.'}
             </div>
           ) : (
             <Accordion type="single" collapsible className="w-full">
               {filteredServices.map((service) => (
                <AccordionItem value={`item-${service.id}`} key={service.id} className="border-border">
                  <AccordionTrigger className="hover:no-underline text-foreground hover:bg-accent/10 p-4 rounded-md">
                    <div className="flex justify-between items-center w-full">
                       <div className="flex items-center gap-2">
                         <span className={`h-2 w-2 rounded-full ${service.isActive ? 'bg-green-500' : 'bg-gray-400'}`} title={service.isActive ? 'Active' : 'Inactive'}></span>
                         <span className="font-medium">{service.name}</span>
                       </div>
                        <Badge variant="secondary" className="bg-secondary text-secondary-foreground">{service.category}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 space-y-3">
                    <p className="text-muted-foreground">{service.description}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                       <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-4 w-4" /> Price: <span className="font-medium text-foreground">{service.price}</span>
                       </div>
                       <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" /> SLA: <span className="font-medium text-foreground">{service.sla}</span>
                       </div>
                    </div>
                     <div className="mt-4 flex justify-end gap-2">
                       <Button size="sm" variant="ghost" onClick={() => handleEditService(service)} className="gap-1 text-primary hover:bg-primary/10 hover:text-primary">
                         <Edit className="h-3.5 w-3.5"/> Edit
                       </Button>
                       <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(service)} className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive">
                         <Trash2 className="h-3.5 w-3.5"/> Delete
                       </Button>
                     </div>
                  </AccordionContent>
                </AccordionItem>
               ))}
             </Accordion>
           )}
         </CardContent>
         <CardFooter className="border-t border-border pt-4">
            <div className="text-xs text-muted-foreground">
              Showing <strong>{filteredServices.length}</strong> of <strong>{services.length}</strong> services.
            </div>
         </CardFooter>
       </Card>

       <p className="text-sm text-muted-foreground">
         Manage the list of available services. Audit logs and role-based access are applied.
       </p>

       <ServiceFormModal
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSubmit={handleSaveService}
         serviceData={editingService}
       />
       <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteService}
        itemName={serviceToDelete?.name || 'this service'}
      />
     </div>
  );
}
