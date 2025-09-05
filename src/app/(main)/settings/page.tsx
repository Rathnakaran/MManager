
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
import { CalendarIcon, UserPlus, KeyRound, UserCog, Edit, Users, Trash2 } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { createUser, getUserById, updateUserPassword, getUsers, updateUser, deleteUser } from '@/lib/actions';
import { Separator } from '@/components/ui/separator';
import type { User } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


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
  account_type: z.enum(['user', 'admin'], { required_error: 'Account type is required.' }),
});

type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

const editUserFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  dateOfBirth: z.date({ required_error: 'Date of birth is required.' }),
});
type EditUserFormValues = z.infer<typeof editUserFormSchema>;

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateCalendarOpen, setIsCreateCalendarOpen] = useState(false);
  const [isEditCalendarOpen, setIsEditCalendarOpen] = useState(false);


  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const fetchUsers = async () => {
    const userId = localStorage.getItem('loggedInUserId');
    if (!userId) return;

    const [fetchedUser, allFetchedUsers] = await Promise.all([
        getUserById(userId),
        getUsers()
    ]);
    setCurrentUser(fetchedUser);
    setAllUsers(allFetchedUsers);
  };

  useEffect(() => {
    fetchUsers();
    const randomQuote = tamilQuotes[Math.floor(Math.random() * tamilQuotes.length)];
    setQuote(randomQuote);
  }, []);

  const createUserForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: { username: '', email: '', password: '', name: '', account_type: 'user' },
  });

  const editUserForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
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
    if (!selectedUser) return;
    startTransition(async () => {
        try {
            await updateUserPassword(selectedUser.id, values.newPassword);
            toast({
                title: 'Success!',
                description: `Password for ${selectedUser.username} changed successfully. "Vaathi coming!"`,
            });
            passwordForm.reset();
            setIsChangePasswordOpen(false);
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
        await fetchUsers(); // Re-fetch users to update the list
        toast({
          title: 'Success!',
          description: `User "${values.username}" has been created.`,
        });
        createUserForm.reset();
        setIsCreateUserOpen(false);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create user. This username might already be taken.',
        });
      }
    });
  };
  
  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
        toast({ variant: 'destructive', title: 'Error', description: "Admin can't delete their own account. 'Enna da, plan la maaripochu?'" });
        return;
    }
    startTransition(async () => {
        try {
            await deleteUser(userId);
            await fetchUsers();
            toast({
                title: 'Success!',
                description: 'User has been deleted successfully.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete user.',
            });
        }
    });
  }

  const onEditUserSubmit = (values: EditUserFormValues) => {
    if (!selectedUser) return;
    startTransition(async () => {
      try {
        const userData = {
            name: values.name,
            email: values.email,
            dateOfBirth: values.dateOfBirth.toISOString().split('T')[0],
        }
        await updateUser(selectedUser.id, userData);
        await fetchUsers();
        toast({
          title: 'Success!',
          description: `User "${selectedUser.username}" has been updated.`,
        });
        setIsEditUserOpen(false);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update user.',
        });
      }
    });
  };
  
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    editUserForm.reset({ name: user.name, email: user.email, dateOfBirth: new Date(user.dateOfBirth) });
    setIsEditUserOpen(true);
  }

  const openPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setIsChangePasswordOpen(true);
  }

  if (!currentUser) {
    return <div>Loading user profile...</div>; // Or a skeleton loader
  }

  const isAdmin = currentUser.account_type === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold font-headline">Settings</h1>
        <p className="text-sm text-muted-foreground italic text-center sm:text-right">"{quote}"</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserCog /> My Profile</CardTitle>
          <CardDescription>
            This is your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={currentUser.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={currentUser.email} />
            </div>
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
            <Button variant="secondary" onClick={() => openPasswordDialog(currentUser)}><KeyRound className="mr-2"/> Change My Password</Button>
            <Button onClick={handleProfileUpdate}>Save My Profile</Button>
        </CardFooter>
      </Card>
      
      {isAdmin && (
        <>
            <Separator />
            <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Users /> User Management</CardTitle>
                        <CardDescription>
                            Create, view, and manage user accounts for the application.
                        </CardDescription>
                    </div>
                    <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
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
                            <Form {...createUserForm}>
                                <form onSubmit={createUserForm.handleSubmit(onCreateUserSubmit)} className="space-y-4">
                                    <FormField control={createUserForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., Superstar" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={createUserForm.control} name="username" render={({ field }) => (<FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="new_user" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={createUserForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={createUserForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="********" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={createUserForm.control} name="dateOfBirth" render={({ field }) => (<FormItem className="flex flex-col pt-2"><FormLabel>Date of Birth</FormLabel><Popover open={isCreateCalendarOpen} onOpenChange={setIsCreateCalendarOpen}><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>{field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={(date) => {field.onChange(date); setIsCreateCalendarOpen(false);}} captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} disabled={(date) => date > new Date() || date < new Date('1900-01-01')} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                                    <FormField control={createUserForm.control} name="account_type" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Account Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select an account type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="user">User</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <DialogFooter className='pt-4'>
                                        <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                                        <Button type="submit" disabled={isPending}>{isPending ? 'Creating...' : 'Create User'}</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="space-y-4">
                    {allUsers.map((user) => (
                        <Card key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold flex items-center gap-2">
                                        {user.name}
                                        {user.id === currentUser.id && <Badge variant="secondary">You</Badge>}
                                        {user.account_type === 'admin' && <Badge variant="default">Admin</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4 sm:mt-0">
                                <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}><Edit className="mr-2 h-3 w-3" /> Edit</Button>
                                <Button variant="secondary" size="sm" onClick={() => openPasswordDialog(user)}><KeyRound className="mr-2 h-3 w-3" /> Change Password</Button>
                                {user.id !== currentUser.id && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-3 w-3" /> Delete</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the account for <b>@{user.username}</b> and all of their associated data.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                )}
                            </div>
                        </Card>
                    ))}
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User: @{selectedUser?.username}</DialogTitle>
                    <DialogDescription>
                    Update the user's details. Username cannot be changed.
                    </DialogDescription>
                </DialogHeader>
                <Form {...editUserForm}>
                    <form onSubmit={editUserForm.handleSubmit(onEditUserSubmit)} className="space-y-4">
                    <FormField control={editUserForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={editUserForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={editUserForm.control} name="dateOfBirth" render={({ field }) => (<FormItem className="flex flex-col pt-2"><FormLabel>Date of Birth</FormLabel><Popover open={isEditCalendarOpen} onOpenChange={setIsEditCalendarOpen}><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>{field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={(date) => {field.onChange(date); setIsEditCalendarOpen(false);}} captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} disabled={(date) => date > new Date() || date < new Date('1900-01-01')} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Changes'}</Button>
                    </DialogFooter>
                    </form>
                </Form>
                </DialogContent>
            </Dialog>
      
            {/* Change Password Dialog */}
            <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password for @{selectedUser?.username}</DialogTitle>
                  <DialogDescription>
                    Enter a new password. Make it a strong one, 'thalaiva'!
                  </DialogDescription>
                </DialogHeader>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onChangePasswordSubmit)} className="space-y-4">
                    <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (<FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" placeholder="********" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" placeholder="********" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                      <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Password'}</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
        </>
      )}
    </div>
  );
}

    
