
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getUserByUsername } from '@/lib/actions';
import { useTransition, useState, useEffect } from 'react';

const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type FormValues = z.infer<typeof formSchema>;

const welcomeDialogues = [
  "Welcome Back!",
  "Vanakkam, Thalaiva!",
  "Vetri Nichayam!",
  "En Vazhi, Thani Vazhi.",
  "Naan Veezhven Endru Ninaithayo?",
  "Singam Single-a Dhaan Varum."
];

const setCookie = (name: string, value: string, days: number) => {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [welcomeMessage, setWelcomeMessage] = useState(welcomeDialogues[0]);

  useEffect(() => {
    setWelcomeMessage(welcomeDialogues[Math.floor(Math.random() * welcomeDialogues.length)]);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const user = await getUserByUsername(values.username, values.password);
        if (user) {
          setCookie('loggedInUserId', user.id, 7); // Set cookie for 7 days
          toast({
            title: 'Success!',
            description: `Welcome back, ${user.username}! "Vaathi Coming!"`,
          });
          router.push('/dashboard');
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Invalid username or password. "Enna da, plan la maaripochu?"',
          });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong during login.',
        });
      }
    });
  };

  return (
    <Card className="w-full max-w-md mx-4">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold font-headline">{welcomeMessage}</CardTitle>
        <CardDescription>"Kanaku ellam correct-a irukanum!" Login to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="thalaivar_superstar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
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
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
