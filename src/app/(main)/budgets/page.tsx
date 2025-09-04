import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function BudgetsPage() {
  return (
    <div>
        <h1 className="text-3xl font-bold font-headline mb-4">Budgets</h1>
        <Card>
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>This feature is under construction.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>The Budgets page will allow you to set monthly spending limits for different categories and track your progress. You'll even get AI-powered icon suggestions for your new budget categories!</p>
            </CardContent>
        </Card>
    </div>
  );
}
