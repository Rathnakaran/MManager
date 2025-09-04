
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { addRecurring, updateRecurring } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Recurring } from '@/types';
import { useTransition } from 'react';

const formSchema = z.object({
  description: z.string().min(2, { message: 'Description must be at least 2 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be a positive number.' }),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, { message: 'Please select a category.' }),
  frequency: z.enum(['monthly', 'yearly']),
  startDate: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

interface RecurringFormProps {
  recurring?: Recurring | null;
  categories: string[];
  onFinished: () => void;
}

export default function RecurringForm({ recurring, categories, onFinished }: RecurringFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: recurring?.description || '',
      amount: recurring?.amount || 0,
      type: recurring?.type || 'expense',
      category: recurring?.category || '',
      frequency: recurring?.frequency || 'monthly',
      startDate: recurring?.startDate ? new Date(recurring.startDate) : new Date(),
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const recurringData = {
          ...values,
          startDate: values.startDate.toISOString().split('T')[0],
        };
        if (recurring) {
          await updateRecurring(recurring.id, recurringData);
          toast({ title: 'Success', description: 'Recurring transaction updated.' });
        } else {
          await addRecurring(recurringData);
          toast({ title: 'Success', description: 'Recurring transaction added.' });
        }
        onFinished();
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong.' });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Monthly Salary" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

         <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
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
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onFinished}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : (recurring ? 'Save Changes' : 'Add Item')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
