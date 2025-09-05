
'use client';

import React, { useState, useTransition, ChangeEvent } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { KeyRound, UserCog, Camera } from 'lucide-react';
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
  const [photo, setPhoto] = useState<string | null>(currentUser.photoURL || null);
  const [isUploading, setIsUploading] = useState(false);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

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
  
  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadstart = () => setIsUploading(true);
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
        } else {
            if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Compress to JPEG
        
        setPhoto(dataUrl);
        startTransition(async () => {
          try {
            await updateUser(currentUser.id, { photoURL: dataUrl });
            onProfileUpdate(); // Refresh user data
            toast({ title: 'Success!', description: 'Profile picture updated.' });
          } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save photo.' });
          } finally {
            setIsUploading(false);
          }
        });
      };
    };
    reader.readAsDataURL(file);
  };

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
            <div className="flex items-center gap-6">
                <div className="relative">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={photo || ''} alt={currentUser.name} />
                        <AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <Button 
                        type="button"
                        size="icon" 
                        className="absolute bottom-0 right-0 rounded-full"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={isUploading || isPending}
                    >
                        {isUploading ? <MiniLoader /> : <Camera className="h-4 w-4" />}
                    </Button>
                    <Input 
                        type="file" 
                        className="hidden" 
                        ref={photoInputRef}
                        accept="image/png, image/jpeg" 
                        onChange={handlePhotoUpload}
                        disabled={isUploading || isPending}
                    />
                </div>
              <div className="grid w-full gap-4">
                  <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                              <Input {...field} disabled={isPending || isUploading} />
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
                              <Input type="email" {...field} disabled={isPending || isUploading} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" disabled value={format(new Date(currentUser.dateOfBirth), 'PPP')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue={currentUser.username} disabled />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="secondary" onClick={onPasswordChangeClick} disabled={isPending || isUploading}>
              <KeyRound className="mr-2" /> Change My Password
            </Button>
            <Button type="submit" disabled={isPending || isUploading}>
              {isPending ? 'Saving...' : 'Save My Profile'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
