
'use client';

import React, { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

// Define Zod schema for validation
const userFormSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  role: z.string().min(1, { message: "Please select a role." }),
  status: z.string().min(1, { message: "Please select a status." }),
});

export type UserFormData = z.infer<typeof userFormSchema>;

export interface UserData extends UserFormData {
  id: string;
  // Add any other fields you might fetch from Firestore for display or logic
  createdAt?: any; // Firestore Timestamp or Date
  lastLogin?: any; // Firestore Timestamp or Date
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  userData?: UserData | null; // Data for editing, includes id
  availableRoles?: string[];
  availableStatuses?: string[];
  isInviteMode?: boolean; // To differentiate between invite and edit
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  userData,
  availableRoles = ['Administrator', 'Teacher', 'Student', 'Read Only'], // Default roles
  availableStatuses = ['Active', 'Inactive', 'Pending'], // Default statuses
  isInviteMode = false,
}: UserFormModalProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      displayName: '',
      email: '',
      role: '',
      status: 'Pending', // Default status for invite mode
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      if (userData && !isInviteMode) {
        form.reset({
          displayName: userData.displayName || '',
          email: userData.email || '',
          role: userData.role || '',
          status: userData.status || 'Active',
        });
      } else if (isInviteMode) {
        form.reset({
          displayName: '',
          email: '',
          role: '', // Or a default role for invites
          status: 'Pending',
        });
      } else {
         form.reset({ displayName: '', email: '', role: '', status: 'Pending' });
      }
    }
  }, [isOpen, userData, isInviteMode, form]);

  const handleFormSubmit: SubmitHandler<UserFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      // onClose will be called by the parent component upon successful submission
    } catch (error) {
      console.error("Error in UserFormModal submission:", error);
      // Parent component should handle toast notifications for errors
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = isInviteMode ? 'Invite New User' : (userData ? 'Edit User' : 'Add New User');
  const description = isInviteMode ? 'Enter the details for the new user invitation.' : (userData ? 'Update the user details.' : 'Fill in the details for the new user.');
  const submitButtonText = isSubmitting ? 'Saving...' : (isInviteMode ? 'Send Invitation' : (userData ? 'Save Changes' : 'Add User'));


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="e.g., user@example.com" {...field} disabled={!isInviteMode && !!userData} />
                  </FormControl>
                  {!isInviteMode && !!userData && <p className="text-xs text-muted-foreground">Email cannot be changed for existing users.</p>}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.map(roleOpt => (
                        <SelectItem key={roleOpt} value={roleOpt}>{roleOpt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isInviteMode && ( // Status field is only relevant when editing, not for new invites typically
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {availableStatuses.map(statusOpt => (
                                <SelectItem key={statusOpt} value={statusOpt}>{statusOpt}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
            )}
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitButtonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
