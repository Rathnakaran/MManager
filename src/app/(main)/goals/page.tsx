import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function GoalsPage() {
  return (
    <div>
        <h1 className="text-3xl font-bold font-headline mb-4">Goals</h1>
        <Card>
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>This feature is under construction.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>The Goals page will help you set, track, and achieve your financial goals. You'll be able to create goals for things like a new car, a vacation, or an emergency fund, and visualize your progress.</p>
            </CardContent>
        </Card>
    </div>
  );
}
