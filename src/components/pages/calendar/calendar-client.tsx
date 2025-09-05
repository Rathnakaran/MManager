
'use client';

import { useState, useEffect } from 'react';
import type { Transaction } from '@/types';
import { getTransactions, getUserIdFromCookie } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import CalendarView from './calendar-view';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type CalendarViewType = 'monthly' | 'weekly' | 'daily';

interface CalendarClientProps {
  initialTransactions: Transaction[];
}

export default function CalendarClient({ initialTransactions }: CalendarClientProps) {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [view, setView] = useState<CalendarViewType>('monthly');
    const { toast } = useToast();

    const fetchData = async () => {
        const userId = await getUserIdFromCookie();
        if (!userId) {
            return;
        }
        
        getTransactions(userId)
            .then(setTransactions)
            .catch(() => toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch transactions.' }))
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold font-headline">Transaction Calendar</h1>
                <div className='flex items-center gap-4'>
                    <p className="text-sm text-muted-foreground italic hidden md:block">"Oru naal-la enna nadakkudhu nu paaru!"</p>
                    <Select value={view} onValueChange={(value) => setView(value as CalendarViewType)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select view" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthly">Monthly View</SelectItem>
                            <SelectItem value="weekly">Weekly View</SelectItem>
                            <SelectItem value="daily">Daily View</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <CalendarView 
                transactions={transactions} 
                onDataChange={fetchData}
                view={view}
            />
        </div>
    );
}
