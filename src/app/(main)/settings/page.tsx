
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
import { CalendarIcon, UserPlus } from 'lucide-react';
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
import { createUser } from '@/lib/actions';
import { Separator } from '@/components/ui/separator';

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
});

type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

export default function SettingsPage() {
  const [quote, setQuote] = useState(tamilQuotes[0]);
  const [dob, setDob] = useState<Date | undefined>(new Date('1990-01-01'));
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const userForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    setQuote(tamilQuotes[Math.floor(Math.random() * tamilQuotes.length)]);
  }, []);

  const handleSaveChanges = () => {
    toast({
      title: 'Success!',
      description: 'Your changes have been saved. "Katham Katham... Mudinjadhu Mudinju Potum!"',
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
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create user. This username might already be taken.',
        });
      }
    });
  };

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
              <Input id="name" defaultValue="Thalaivar" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="thalaivar@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="dob"
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dob && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dob ? format(dob, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dob}
                    onSelect={setDob}
                    captionLayout="buttons"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="thalaivar_superstar" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input id="mobile" defaultValue="+91 98765 43210" disabled />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button onClick={handleSaveChanges}>Save Profile</Button>
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
            <Form {...userForm}>
                <form onSubmit={userForm.handleSubmit(onCreateUserSubmit)} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
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
                                <FormItem className="flex flex-col mt-2">
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
                    </div>
                     <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Creating User...' : 'Create New User'}
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
