
import TransactionsClient from '@/components/pages/transactions/transactions-client';
import { getTransactions, getBudgetCategories, getGoalCategories, getUserIdFromCookie } from '@/lib/actions';
import { notFound } from 'next/navigation';

export default async function TransactionsPage() {
    const userId = await getUserIdFromCookie();
    if (!userId) {
      notFound();
    }
    
    const [transactions, budgetCats, goalCats] = await Promise.all([
        getTransactions(userId),
        getBudgetCategories(userId),
        getGoalCategories(userId)
    ]);

    const categories = { budgetCategories: budgetCats, goalCategories: goalCats };

    return <TransactionsClient initialTransactions={transactions} initialCategories={categories} />;
}
