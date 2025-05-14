
'use client';

import React, { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Save } from 'lucide-react';

const profileSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters." })
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"], // path of error
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, displayName, updateUserDisplayName, updateUserPassword, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isProfileSaving, setIsProfileSaving] = React.useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = React.useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  useEffect(() => {
    if (displayName) {
      profileForm.reset({ displayName });
    }
  }, [displayName, profileForm]);

  const handleProfileSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    setIsProfileSaving(true);
    try {
      await updateUserDisplayName(data.displayName);
      toast({ title: 'Success', description: 'Profile updated successfully.' });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ title: 'Error', description: error.message || 'Could not update profile.', variant: 'destructive' });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handlePasswordSubmit: SubmitHandler<PasswordFormData> = async (data) => {
    setIsPasswordSaving(true);
    try {
      await updateUserPassword(data.currentPassword, data.newPassword);
      toast({ title: 'Success', description: 'Password changed successfully.' });
      passwordForm.reset();
    } catch (error: any) {
      console.error("Error changing password:", error);
      let desc = 'Could not change password.';
      if (error.code === 'auth/wrong-password') {
        desc = 'Incorrect current password.';
      } else if (error.code === 'auth/too-many-requests') {
        desc = 'Too many attempts. Please try again later.';
      }
      toast({ title: 'Error', description: desc, variant: 'destructive' });
    } finally {
      setIsPasswordSaving(false);
    }
  };
  
  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) return name.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return 'U';
  };

  if (authLoading) {
    return <div className="flex justify-center items-center min-h-[200px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Loading profile...</p></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold leading-none tracking-tight">
        User Profile
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Manage your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.photoURL || undefined} alt={displayName || user?.email || "User"} data-ai-hint="person avatar" />
              <AvatarFallback className="text-2xl">{getInitials(displayName, user?.email)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Avatar upload is not yet implemented.</p>
            </div>
          </div>

          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your display name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Input value={user?.email || ''} readOnly disabled className="bg-muted/50" />
                <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
              </FormItem>
              <Button type="submit" disabled={isProfileSaving}>
                {isProfileSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter current password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                     <p className="text-xs text-muted-foreground">Min 8 chars, 1 uppercase, 1 lowercase, 1 number.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPasswordSaving}>
                {isPasswordSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
