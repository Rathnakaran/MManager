
'use client';

import { useState, useEffect } from 'react';
import type { Transaction } from '@/types';
import { getTransactions } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import AppLoader from '@/components/layout/app-loader';
import CalendarView from './calendar-view';

export default function CalendarClient() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const userId = localStorage.getItem('loggedInUserId');
        if (!userId) return;

        setIsLoading(true);
        getTransactions(userId)
            .then(setTransactions)
            .catch(() => toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch transactions.' }))
            .finally(() => setIsLoading(false));
    }, [toast]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-background z-50">
                <AppLoader />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-headline">Transaction Calendar</h1>
                <p className="text-sm text-muted-foreground italic">"Oru naal-la enna nadakkudhu nu paaru!" (See what happens in a day!)</p>
            </div>
            <CalendarView transactions={transactions} />
        </div>
    );
}
