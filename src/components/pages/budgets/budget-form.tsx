
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
import { useState, useTransition } from 'react';
import { suggestIcon } from '@/ai/flows/ai-icon-suggestion';
import { cn } from '@/lib/utils';
import { Lightbulb, RotateCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

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

  const handleSuggestIcon = () => {
    const categoryName = form.getValues('category');
    if (!categoryName) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter a category name first.' });
        return;
    }
    
    setIsSuggesting(true);
    setSuggestionError(null);
    startTransition(async () => {
        try {
            const result = await suggestIcon({ categoryName });
            if (result.iconName) {
                form.setValue('icon', result.iconName, { shouldValidate: true });
                toast({ title: 'Suggestion applied!', description: `Icon set to "${result.iconName}".`});
            } else {
                toast({ title: 'No suggestion found', description: 'Could not determine an icon.'});
            }
        } catch (error: any) {
             if (error.message && error.message.includes('503 Service Unavailable')) {
                setSuggestionError('The AI model is overloaded. Please try again in a moment.');
            } else {
                setSuggestionError('Failed to get icon suggestion. Please try again.');
            }
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to get icon suggestion.' });
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
                    <FormLabel>Icon Name (from Lucide React)</FormLabel>
                    <div className="flex gap-2">
                        <Input placeholder="e.g., ShoppingCart (optional)" {...field} />
                        <Button type="button" variant="outline" size="icon" onClick={handleSuggestIcon} disabled={isSuggesting || isPending}>
                            <Lightbulb className={cn("h-4 w-4", isSuggesting && "animate-pulse")} />
                        </Button>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />

        {suggestionError && (
            <Alert variant="destructive" className="flex items-center justify-between">
                <AlertDescription className="text-xs">
                    {suggestionError}
                </AlertDescription>
                 <Button type="button" variant="ghost" size="sm" onClick={handleSuggestIcon} disabled={isSuggesting || isPending}>
                    <RotateCw className={`mr-2 h-3 w-3 ${isSuggesting ? 'animate-spin' : ''}`} />
                    Retry
                </Button>
            </Alert>
        )}
        
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onFinished}>Cancel</Button>
            <Button type="submit" disabled={isPending || isSuggesting}>
              {isPending ? 'Saving...' : (budget ? 'Save Changes' : 'Add Budget')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
