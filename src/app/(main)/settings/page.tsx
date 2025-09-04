
'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, UserPlus, KeyRound } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { createUser, getUserByUsername, updateUserPassword } from '@/lib/actions';
import { Separator } from '@/components/ui/separator';
import type { User } from '@/types';

const tamilQuotes = [
  "Nama Oru Thadava Mudivu Panita, Aprom Nama Pecha Nameye Kekkamattom.",
  "Yaaru Kitta Thoothu Ponomgrathu Mukkiyam Illa, Ethukaga Thoothu Ponomgrathu Dha Mukkiyam.",
  "Kashtapadama Ethuvum Kedaikathu, Kashtapadama Kedaikurathu Ennikum Nilaikathu.",
  "Naa Veesara Valai... Alai Alla... Malai!",
  "Vaazhkai-la Bayam Irukanum, Aana Bayame Vaazhkai Aagida Koodathu."
];

const createUserFormSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  dateOfBirth: z.date({ required_error: 'Date of birth is required.' }),
  name: z.string().min(2, { message: 'Name is required.' }),
});

type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

const changePasswordFormSchema = z.object({
  newPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match. 'Enna da, plan la maaripochu?'",
  path: ['confirmPassword'],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export default function SettingsPage() {
  const [quote, setQuote] = useState(tamilQuotes[0]);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // A placeholder to get a user. In a real app, this would come from a session.
  useEffect(() => {
    const fetchUser = async () => {
        const fetchedUser = await getUserByUsername('Rathnakaran');
        setUser(fetchedUser);
    };
    fetchUser();
    setQuote(tamilQuotes[Math.floor(Math.random() * tamilQuotes.length)]);
  }, []);

  const userForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: { username: '', email: '', password: '', name: '' },
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const handleProfileUpdate = () => {
    toast({
      title: 'Success!',
      description: 'Your changes have been saved. "Katham Katham... Mudinjadhu Mudinju Potum!"',
    });
  };

  const onChangePasswordSubmit = (values: ChangePasswordFormValues) => {
    if (!user) return;
    startTransition(async () => {
        try {
            await updateUserPassword(user.id, values.newPassword);
            toast({
                title: 'Success!',
                description: 'Password changed successfully. "Vaathi coming!"',
            });
            passwordForm.reset();
            document.getElementById('close-password-dialog')?.click();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to change password.',
            });
        }
    });
  };

  const onCreateUserSubmit = (values: CreateUserFormValues) => {
    startTransition(async () => {
      try {
        const userData = {
            ...values,
            dateOfBirth: values.dateOfBirth.toISOString().split('T')[0],
        }
        await createUser(userData);
        toast({
          title: 'Success!',
          description: `User "${values.username}" has been created.`,
        });
        userForm.reset();
        document.getElementById('close-create-user-dialog')?.click();
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create user. This username might already be taken.',
        });
      }
    });
  };

  if (!user) {
    return <div>Loading user profile...</div>; // Or a skeleton loader
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold font-headline">Settings</h1>
        <p className="text-sm text-muted-foreground italic text-center sm:text-right">"{quote}"</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            This is how others will see you on the site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={user.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
               <Input id="dob" disabled value={format(new Date(user.dateOfBirth), 'PPP')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue={user.username} disabled />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary"><KeyRound className="mr-2"/> Change Password</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Your Password</DialogTitle>
                  <DialogDescription>
                    Enter a new password below. Make it a strong one, 'thalaiva'!
                  </DialogDescription>
                </DialogHeader>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onChangePasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="********" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="********" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <DialogClose asChild><Button id="close-password-dialog" type="button" variant="ghost">Cancel</Button></DialogClose>
                      <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Password'}</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Button onClick={handleProfileUpdate}>Save Profile</Button>
        </CardFooter>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus /> Admin Panel</CardTitle>
          <CardDescription>
            Create a new user account. Only admins can see this panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Dialog>
                <DialogTrigger asChild>
                    <Button><UserPlus className="mr-2 h-4 w-4" /> Create New User</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a New User</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to create a new user account.
                        </DialogDescription>
                    </DialogHeader>
                     <Form {...userForm}>
                        <form onSubmit={userForm.handleSubmit(onCreateUserSubmit)} className="space-y-4">
                            <FormField
                                control={userForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Superstar" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={userForm.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="new_user" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={userForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="user@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={userForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="********" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={userForm.control}
                                name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2">
                                    <FormLabel>Date of Birth</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={'outline'}
                                            className={cn(
                                                'w-full pl-3 text-left font-normal',
                                                !field.value && 'text-muted-foreground'
                                            )}
                                            >
                                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            captionLayout="buttons"
                                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <DialogFooter className='pt-4'>
                                <DialogClose asChild><Button id="close-create-user-dialog" type="button" variant="ghost">Cancel</Button></DialogClose>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? 'Creating...' : 'Create User'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
