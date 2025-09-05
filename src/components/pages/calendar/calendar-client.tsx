
'use client';

import { useState, useEffect } from 'react';
import type { Transaction } from '@/types';
import { getTransactions, getUserIdFromCookie } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import AppLoader from '@/components/layout/app-loader';
import CalendarView from './calendar-view';

export default function CalendarClient() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchData = async () => {
        const userId = await getUserIdFromCookie();
        if (!userId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        getTransactions(userId)
            .then(setTransactions)
            .catch(() => toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch transactions.' }))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchData();
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
            <CalendarView transactions={transactions} onDataChange={fetchData} />
        </div>
    );
}
