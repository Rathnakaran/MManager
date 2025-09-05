
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
import { useToast } from '@/hooks/use-toast';
import type { Budget } from '@/types';
import { useTransition } from 'react';
import { IconPicker } from '@/components/ui/icon-picker';

const formSchema = z.object({
  category: z.string().min(2, { message: 'Category name must be at least 2 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be a positive number.' }),
  icon: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BudgetFormProps {
  budget?: Budget | null;
  onFinished: () => void;
  onFormSubmit: (values: Omit<Budget, 'id' | 'userId'>, id?: string) => void;
}

export default function BudgetForm({ budget, onFinished, onFormSubmit }: BudgetFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: budget?.category || '',
      amount: budget?.amount || 0,
      icon: budget?.icon || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(() => {
      const finalValues = {
        ...values,
        icon: values.icon || 'CircleDollarSign' // Provide a default icon if none is entered
      };
      onFormSubmit(finalValues, budget?.id);
      form.reset();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Groceries" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
              <FormItem>
              <FormLabel>Budget Amount</FormLabel>
              <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
              </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Icon (Optional)</FormLabel>
                     <FormControl>
                        <IconPicker 
                            value={field.value}
                            onChange={field.onChange}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onFinished}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : (budget ? 'Save Changes' : 'Add Budget')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
