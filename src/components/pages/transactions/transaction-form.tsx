
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
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Lightbulb } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Transaction } from '@/types';
import { useState, useTransition } from 'react';
import { suggestCategory } from '@/ai/flows/ai-category-suggestion';
import { getUserIdFromCookie } from '@/lib/actions';

const formSchema = z.object({
  description: z.string().min(2, { message: 'Description must be at least 2 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be a positive number.' }),
  date: z.date(),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, { message: 'Please select a category.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  transaction?: Transaction | null;
  categories: { budgetCategories: string[], goalCategories: string[] };
  onFinished: () => void;
  onFormSubmit: (values: Omit<Transaction, 'id' | 'userId' | 'date'> & { date: Date }, id?: string) => void;
}

export default function TransactionForm({ transaction, categories, onFinished, onFormSubmit }: TransactionFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: transaction?.description || '',
      amount: transaction?.amount || 0,
      date: transaction?.date ? new Date(transaction.date + 'T00:00:00') : new Date(),
      type: transaction?.type || 'expense',
      category: transaction?.category || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(() => {
        onFormSubmit(values, transaction?.id);
        form.reset({
            description: '',
            amount: 0,
            date: new Date(),
            type: 'expense',
            category: ''
        });
    });
  };

  const handleSuggestCategory = () => {
    const description = form.getValues('description');
    if (!description) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter a description first.' });
        return;
    }
    
    startTransition(async () => {
        setIsSuggesting(true);
        try {
            const allCategories = [...categories.budgetCategories, ...categories.goalCategories, "Other"];
            const result = await suggestCategory({ description, categories: allCategories });
            if (result.suggestedCategory) {
                form.setValue('category', result.suggestedCategory, { shouldValidate: true });
                toast({ title: 'Suggestion applied!', description: `Category set to "${result.suggestedCategory}".`});
            } else {
                toast({ title: 'No suggestion found', description: 'Could not determine a category.'});
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to get category suggestion.' });
        } finally {
            setIsSuggesting(false);
        }
    });
  }

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
                <Input placeholder="e.g., Coffee with friends" {...field} />
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

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                    captionLayout="dropdown-buttons"
                    fromYear={new Date().getFullYear() - 10}
                    toYear={new Date().getFullYear()}
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                        field.onChange(date);
                        setIsCalendarOpen(false);
                    }}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Category</FormLabel>
                    <div className="flex gap-2">
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {categories.goalCategories.length > 0 && (
                                    <SelectGroup>
                                        <SelectLabel>Goal Contributions</SelectLabel>
                                        {categories.goalCategories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                )}
                                {categories.budgetCategories.length > 0 && (
                                    <SelectGroup>
                                        <SelectLabel>Budget Categories</SelectLabel>
                                        {categories.budgetCategories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                )}
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" size="icon" onClick={handleSuggestCategory} disabled={isSuggesting || isPending}>
                            <Lightbulb className={cn("h-4 w-4", isSuggesting && "animate-pulse")} />
                        </Button>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onFinished}>Cancel</Button>
            <Button type="submit" disabled={isPending || isSuggesting}>
              {isPending ? 'Saving...' : (transaction ? 'Save Changes' : 'Add Transaction')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
