import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function RecurringPage() {
  return (
    <div>
        <h1 className="text-3xl font-bold font-headline mb-4">Recurring</h1>
        <Card>
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>This feature is under construction.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>The Recurring page will allow you to manage your regular income and expenses, like your monthly salary, rent, or subscriptions. This will help you get a clear picture of your fixed cash flow.</p>
            </CardContent>
        </Card>
    </div>
  );
}
