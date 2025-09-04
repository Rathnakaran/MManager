
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { addGoal, updateGoal } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Goal } from '@/types';
import { useTransition } from 'react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Goal name must be at least 2 characters.' }),
  targetAmount: z.coerce.number().positive({ message: 'Target amount must be a positive number.' }),
  currentAmount: z.coerce.number().nonnegative({ message: 'Current amount cannot be negative.' }),
  targetDate: z.date({ required_error: 'A target date is required.' }),
}).refine(data => data.currentAmount <= data.targetAmount, {
  message: "Current amount cannot be greater than the target amount.",
  path: ["currentAmount"],
});


type FormValues = z.infer<typeof formSchema>;

interface GoalFormProps {
  goal?: Goal | null;
  onFinished: () => void;
}

export default function GoalForm({ goal, onFinished }: GoalFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: goal?.name || '',
      targetAmount: goal?.targetAmount || 0,
      currentAmount: goal?.currentAmount || 0,
      targetDate: goal?.targetDate ? new Date(goal.targetDate) : undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const goalData = {
          ...values,
          targetDate: values.targetDate.toISOString().split('T')[0],
        };
        if (goal) {
          await updateGoal(goal.id, goalData);
          toast({ title: 'Success', description: 'Goal updated successfully. "Adan summaava sonnanga?!"' });
        } else {
          await addGoal(goalData);
          toast({ title: 'Success', description: 'Goal added successfully. "Now, we are back to form!"' });
        }
        onFinished();
        form.reset();
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Goa Trip" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="targetAmount"
          render={({ field }) => (
              <FormItem>
              <FormLabel>Target Amount</FormLabel>
              <FormControl>
                  <Input type="number" step="100" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
              </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currentAmount"
          render={({ field }) => (
              <FormItem>
              <FormLabel>Current Amount Saved</FormLabel>
              <FormControl>
                  <Input type="number" step="100" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
              </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Target Date</FormLabel>
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
                    disabled={(date) => date < new Date()}
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
              {isPending ? 'Saving...' : (goal ? 'Save Changes' : 'Add Goal')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
