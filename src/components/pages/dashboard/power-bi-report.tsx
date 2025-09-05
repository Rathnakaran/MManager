
'use client';

import { BarChart } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function PowerBiReport() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          Power BI Analytics
        </CardTitle>
        <CardDescription>
          Your interactive financial report. Replace the placeholder below with your actual Power BI embed URL.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <iframe
          title="Power BI Report"
          width="100%"
          height="540"
          src="https://app.powerbi.com/view?r=eyJrIjoiYOUR_REPORT_ID_HEREiLCJ0IjoiYOUR_TENANT_ID_HEREi"
          allowFullScreen={true}
          className="border-0 rounded-lg"
        ></iframe>
      </CardContent>
    </Card>
  );
}
