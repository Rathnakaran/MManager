
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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getUserByUsername } from '@/lib/actions';
import { useTransition, useState, useEffect } from 'react';
import { Info } from 'lucide-react';

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

const descriptionDialogues = [
    "\"Kanaku ellam correct-a irukanum!\" Login to continue.",
    "\"Money is not everything, but it's something very important.\" Login to proceed.",
    "\"Every rupee counts. Let's make them count!\" Login to start.",
    "\"The secret to getting ahead is getting started.\" Login below.",
    "\"Your financial journey begins here.\" Login to FinWise."
];

const errorDialogues = [
    "Invalid username or password. \"Enna da, plan la maaripochu?\"",
    "Wrong details! \"Try again, 'nanba'.\"",
    "Incorrect credentials. \"Nadakkura vayasula sarakkudhama...\"",
    "Login failed. \"Moonu nimisham... time kudu... ipo sollunga.\"",
    "Access denied. \"Therikka vidalama!\"... but with the right password.",
    "Wrong password! 'Naan saavuradhu urudhi, adha un kaiyaladhan... illa'.",
    "Who are you? 'Yaaru nee? Enga irundhu varinga?'",
    "Details not matching. 'Panatha thottavan, thottadhelam thulangaadhu'. Be careful.",
    "Try again. 'Kashtapadama edhuvum kedaikathu.'",
    "User not found. 'Yaarume illa, thambi.' Check your username."
];

const successDialogues = [
    "Vaathi Coming!",
    "Success! Kelambittanya kelambittan...",
    "Correct-a pannita! Welcome back!",
    "Welcome! The boss has arrived.",
    "Naanga yaru nu theriyulla? FinWise thalaivar!",
];

const creatorDialogues = [
    "\"En vazhi, thani vazhi.\" - Superstar Rajinikanth",
    "\"Vaazhkai-la bayam irukanum, aana bayame vaazhkai aagida koodathu.\" - Ajith Kumar",
    "\"I'm waiting!\" - Vijay",
    "\"Kashtapadama edhuvum kedaikathu, kashtapadama kedaikurathu ennikum nilaikaadhu.\" - Superstar Rajinikanth",
    "\"Don't trouble the trouble. If you trouble the trouble, trouble will trouble you!\" - Ajith Kumar",
    "\"It's just the beginning.\" - Vijay",
    "\"Naan veezhven endru ninaithayo?\" - Superstar Rajinikanth",
    "\"Once I decide, I don't even listen to myself.\" - Ajith Kumar",
    "\"Never Ever Give Up.\" - Ajith Kumar",
    "\"Singam single-a dhaan varum.\" - Superstar Rajinikanth"
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
  const [descriptionMessage, setDescriptionMessage] = useState(descriptionDialogues[0]);
  const [creatorQuote, setCreatorQuote] = useState(creatorDialogues[0]);

  useEffect(() => {
    setWelcomeMessage(welcomeDialogues[Math.floor(Math.random() * welcomeDialogues.length)]);
    setDescriptionMessage(descriptionDialogues[Math.floor(Math.random() * descriptionDialogues.length)]);
    setCreatorQuote(creatorDialogues[Math.floor(Math.random() * creatorDialogues.length)]);
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
      const errorMessage = errorDialogues[Math.floor(Math.random() * errorDialogues.length)];
      try {
        const user = await getUserByUsername(values.username, values.password);
        if (user) {
          setCookie('loggedInUserId', user.id, 7); // Set cookie for 7 days
          const successMessage = successDialogues[Math.floor(Math.random() * successDialogues.length)];
          toast({
            title: 'Success!',
            description: `Welcome back, ${user.username}! "${successMessage}"`,
          });
          router.push('/dashboard');
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: errorMessage,
            });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
      }
    });
  };

  return (
    <Card className="w-full max-w-md mx-4">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold font-headline">{welcomeMessage}</CardTitle>
        <CardDescription>{descriptionMessage}</CardDescription>
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
      <CardFooter className='justify-center'>
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="link" className="text-xs text-muted-foreground"><Info className='mr-2 h-3 w-3'/> Creator Info</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>MManager Application</DialogTitle>
                    <DialogDescription>
                        This application was designed and developed by:
                    </DialogDescription>
                </DialogHeader>
                <div className='space-y-2'>
                    <p className='font-bold text-lg'>Rathnakaran M</p>
                    <p className='text-sm text-muted-foreground'>rathnakaran480@gmail.com</p>
                    <p className='text-xs italic pt-4'>
                        {creatorQuote}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
