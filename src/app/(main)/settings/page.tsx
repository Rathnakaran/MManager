
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const tamilQuotes = [
  "Nama Oru Thadava Mudivu Panita, Aprom Nama Pecha Nameye Kekkamattom.",
  "Yaaru Kitta Thoothu Ponomgrathu Mukkiyam Illa, Ethukaga Thoothu Ponomgrathu Dha Mukkiyam.",
  "Kashtapadama Ethuvum Kedaikathu, Kashtapadama Kedaikurathu Ennikum Nilaikathu.",
  "Naa Veesara Valai... Alai Alla... Malai!",
  "Vaazhkai-la Bayam Irukanum, Aana Bayame Vaazhkai Aagida Koodathu."
];

export default function SettingsPage() {
  const [quote, setQuote] = useState(tamilQuotes[0]);
  const [dob, setDob] = useState<Date | undefined>(new Date('1990-01-01'));

  useEffect(() => {
    setQuote(tamilQuotes[Math.floor(Math.random() * tamilQuotes.length)]);
  }, []);

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold font-headline">Settings</h1>
        <p className="text-sm text-muted-foreground italic text-center sm:text-right">"{quote}"</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            This is how others will see you on the site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Thalaivar" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="thalaivar@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
               <Popover>
                <PopoverTrigger asChild>
                    <Button
                      id="dob"
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dob && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dob ? format(dob, 'PPP') : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dob}
                    onSelect={setDob}
                    captionLayout="dropdown-buttons"
                    fromYear={1950}
                    toYear={new Date().getFullYear()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="thalaivar_superstar" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input id="mobile" defaultValue="+91 98765 43210" disabled />
            </div>
          </div>
          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
