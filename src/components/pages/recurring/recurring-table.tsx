
'use client';

import type { Recurring } from '@/types';
import { type ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { deleteRecurring } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from '@/components/pages/transactions/data-table';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
  
const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) return;
    try {
      await deleteRecurring(id);
      toast({
        title: 'Success',
        description: 'Recurring transaction deleted successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete recurring transaction.',
      });
    }
  };

const columns = (onEdit: (recurring: Recurring) => void): ColumnDef<Recurring>[] => [
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>,
  },
  {
    accessorKey: 'frequency',
    header: 'Frequency',
    cell: ({ row }) => <span className="capitalize">{row.original.frequency}</span>
  },
   {
    accessorKey: 'startDate',
    header: 'Starts On',
    cell: ({ row }) => formatDate(row.original.startDate),
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const { amount, type } = row.original;
      const isExpense = type === 'expense';
      return (
        <div
          className={`text-right font-medium ${
            isExpense ? 'text-destructive' : 'text-primary'
          }`}
        >
          {isExpense ? '-' : ''}
          {formatCurrency(amount)}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const recurring = row.original;
      return (
        <div className="text-right">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(recurring)}>
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(recurring.id)}
                    >
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      );
    },
  },
];

interface RecurringTableProps {
    data: Recurring[],
    onEdit: (recurring: Recurring) => void
}

export default function RecurringTable({ data, onEdit }: RecurringTableProps) {
  return <DataTable columns={columns(onEdit)} data={data} />;
}
