
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, User, Plus, Edit2, Trash2, MoreVertical, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns'; 
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
  where,
  orderBy,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { ServiceAppointmentFormModal, type AppointmentFormData, type ClientForSelect, type ServiceForSelect, type TechnicianForSelect } from '@/components/services/service-appointment-form-modal';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface ServiceAppointment extends AppointmentFormData {
  id: string;
  clientName?: string; 
  serviceName?: string; 
  technicianName?: string; 
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  scheduledDate: Timestamp; 
}

export default function ServiceSchedulingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<ServiceAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<ServiceAppointment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<ServiceAppointment | null>(null);
  
  const [availableClients, setAvailableClients] = useState<ClientForSelect[]>([]);
  const [availableServices, setAvailableServices] = useState<ServiceForSelect[]>([]);
  const [availableTechnicians, setAvailableTechnicians] = useState<TechnicianForSelect[]>([]);

  const { toast } = useToast();

  const fetchDropdownData = useCallback(async () => {
    try {
      const clientsSnap = await getDocs(query(collection(db, 'clients'), orderBy('name')));
      setAvailableClients(clientsSnap.docs.map(d => ({ id: d.id, name: d.data().name })));

      const servicesSnap = await getDocs(query(collection(db, 'services'), where('isActive', '==', true), orderBy('name')));
      setAvailableServices(servicesSnap.docs.map(d => ({ id: d.id, name: d.data().name })));
      
      const techQuery = query(collection(db, 'users'), where('role', 'in', ['teacher', 'technician', 'admin', 'Administrator']), orderBy('displayName'));
      const techSnap = await getDocs(techQuery);
      setAvailableTechnicians(techSnap.docs.map(d => ({ id: d.id, displayName: d.data().displayName || d.data().email })));

    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      toast({ title: "Error", description: "Could not load data for scheduling form.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  useEffect(() => {
    if (!selectedDate) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, 'serviceAppointments'),
      where('scheduledDate', '>=', Timestamp.fromDate(startOfDay)),
      where('scheduledDate', '<=', Timestamp.fromDate(endOfDay)),
      orderBy('scheduledDate', 'asc'),
      orderBy('scheduledTime', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAppointments = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<ServiceAppointment, 'id'>),
      }));
      setAppointments(fetchedAppointments);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching appointments:", error);
      toast({ title: "Error", description: "Could not fetch appointments.", variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate, toast]);

  const handleAddAppointment = () => {
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const handleEditAppointment = (appointment: ServiceAppointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (appointment: ServiceAppointment) => {
    setAppointmentToDelete(appointment);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteAppointment = async () => {
    if (appointmentToDelete) {
      try {
        await deleteDoc(doc(db, 'serviceAppointments', appointmentToDelete.id));
        toast({ title: "Success", description: "Appointment deleted successfully." });
      } catch (error) {
        console.error("Error deleting appointment:", error);
        toast({ title: "Error", description: "Could not delete appointment.", variant: "destructive" });
      } finally {
        setIsDeleteDialogOpen(false);
        setAppointmentToDelete(null);
      }
    }
  };

  const handleSaveAppointment = async (formData: AppointmentFormData) => {
    const client = availableClients.find(c => c.id === formData.clientId);
    const service = availableServices.find(s => s.id === formData.serviceId);
    const technician = availableTechnicians.find(t => t.id === formData.technicianId);

    const dataToSave = {
      ...formData,
      clientName: client?.name || 'Unknown Client',
      serviceName: service?.name || 'Unknown Service',
      technicianName: technician?.displayName || null,
      scheduledDate: Timestamp.fromDate(formData.scheduledDate),
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingAppointment) {
        const apptDocRef = doc(db, 'serviceAppointments', editingAppointment.id);
        await updateDoc(apptDocRef, dataToSave);
        toast({ title: "Success", description: "Appointment updated successfully." });
      } else {
        await addDoc(collection(db, 'serviceAppointments'), {
          ...dataToSave,
          createdAt: serverTimestamp(),
        });
        toast({ title: "Success", description: "Appointment scheduled successfully." });
      }
      setIsModalOpen(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast({ title: "Error", description: "Could not save appointment.", variant: "destructive" });
    }
  };
  
  const handleChangeStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const apptDocRef = doc(db, 'serviceAppointments', appointmentId);
      await updateDoc(apptDocRef, { status: newStatus, updatedAt: serverTimestamp() });
      toast({ title: "Status Updated", description: `Appointment status changed to ${newStatus}.`});
    } catch (error) {
      console.error("Error updating status:", error);
      toast({ title: "Error", description: "Could not update appointment status.", variant: "destructive"});
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         <div className="flex-1"></div> {/* Spacer */}
         <Button size="sm" className="h-9 gap-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddAppointment}>
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Schedule Service</span>
          </Button>
      </div>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Service Calendar</CardTitle>
          <CardDescription className="text-muted-foreground">Manage and view scheduled service appointments.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-[auto_1fr] lg:grid-cols-[280px_1fr]">
          <div className="border border-border rounded-md p-3 self-start bg-background shadow-sm">
             <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md"
            />
             <p className="text-xs text-center text-muted-foreground mt-2">(Select a date to view appointments)</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Appointments for: {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
            </h3>
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading appointments...</p>
              </div>
            ) : appointments.length > 0 ? (
              <div className="space-y-3 min-h-[200px]">
                {appointments.map(event => (
                   <Card key={event.id} className={`border-border bg-background shadow-sm hover:shadow-md transition-shadow ${event.status === 'Completed' || event.status === 'Cancelled' ? 'opacity-70' : ''}`}>
                    <CardContent className="p-4 flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{event.serviceName}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> {event.clientName}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> 
                          {event.scheduledTime} 
                          {event.technicianName && ` - ${event.technicianName}`}
                        </p>
                        {event.notes && <p className="text-xs text-muted-foreground mt-1 italic">Notes: {event.notes}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant={event.status === 'Completed' ? 'default' : event.status === 'Cancelled' ? 'destructive' : 'outline'}
                          className={
                            event.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700' :
                            event.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700' :
                            event.status === 'Confirmed' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700' :
                            event.status === 'In Progress' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700' :
                            event.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700' :
                            'text-muted-foreground border-border'
                          }
                         >
                           {event.status === 'Completed' && <Check className="h-3 w-3 mr-1"/>}
                           {event.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-foreground hover:bg-accent">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
                            <DropdownMenuItem onClick={() => handleEditAppointment(event)} className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">
                              <Edit2 className="mr-2 h-3.5 w-3.5" />Edit
                            </DropdownMenuItem>
                            {event.status !== 'Completed' && (
                               <DropdownMenuItem onClick={() => handleChangeStatus(event.id, 'Completed')} className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">
                                  <Check className="mr-2 h-3.5 w-3.5" />Mark as Completed
                               </DropdownMenuItem>
                            )}
                            {event.status !== 'Cancelled' && (
                                <DropdownMenuItem onClick={() => handleChangeStatus(event.id, 'Cancelled')} className="hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground">
                                    Cancel Appointment
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDeleteClick(event)} className="text-destructive focus:bg-destructive/10 focus:text-destructive hover:!bg-destructive/10 hover:!text-destructive">
                              <Trash2 className="mr-2 h-3.5 w-3.5" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic pt-4 text-center">No appointments scheduled for this date.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Calendar-based service management. Audit logs and role-based access are applied.
      </p>

      {isModalOpen && (
        <ServiceAppointmentFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAppointment(null);
          }}
          onSubmit={handleSaveAppointment}
          appointmentData={editingAppointment}
          availableClients={availableClients}
          availableServices={availableServices}
          availableTechnicians={availableTechnicians}
          defaultDate={selectedDate}
        />
      )}
      {appointmentToDelete && (
        <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={confirmDeleteAppointment}
            itemName={`appointment for ${appointmentToDelete.clientName} on ${format(appointmentToDelete.scheduledDate.toDate(), 'PPP')}`}
        />
      )}
    </div>
  );
}
    