
'use client';

import React, { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { updateUser } from '@/lib/actions';
import type { User } from '@/types';
import { KeyRound, UserCog } from 'lucide-react';
import MiniLoader from '@/components/layout/mini-loader';
import { format } from 'date-fns';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileCardProps {
  currentUser: User;
  onPasswordChangeClick: () => void;
  onProfileUpdate: () => void;
}

export default function EditProfileCard({ currentUser, onPasswordChangeClick, onProfileUpdate }: EditProfileCardProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: currentUser.name || '',
      email: currentUser.email || '',
    },
  });

  const onProfileSubmit = (values: ProfileFormValues) => {
    startTransition(async () => {
      try {
        await updateUser(currentUser.id, { name: values.name, email: values.email });
        onProfileUpdate(); // Triggers re-fetch on parent
        toast({ title: 'Success!', description: 'Your profile has been updated.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update profile.' });
      }
    });
  };
  
  const formattedDob = React.useMemo(() => {
    if (!currentUser.dateOfBirth) return 'Not Set';
    try {
      const date = new Date(currentUser.dateOfBirth + 'T00:00:00Z');
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, 'PPP');
    } catch (e) {
      return 'Invalid Date';
    }
  }, [currentUser.dateOfBirth]);


  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onProfileSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog /> My Profile
            </CardTitle>
            <CardDescription>View and edit your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input {...field} disabled={isPending} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input type="email" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" disabled value={formattedDob} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue={currentUser.username} disabled />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="secondary" onClick={onPasswordChangeClick} disabled={isPending}>
              <KeyRound className="mr-2" /> Change My Password
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save My Profile'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
