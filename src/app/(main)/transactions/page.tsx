
import TransactionsClient from '@/components/pages/transactions/transactions-client';

export default async function TransactionsPage() {
    // This page is client-side rendered now to access localStorage
    return <TransactionsClient />;
}
