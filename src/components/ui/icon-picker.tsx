
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { getIconByName, Icons, IconName } from '@/components/icons';
import { Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
  defaultValue?: string;
}

const iconList = Object.keys(Icons) as (keyof typeof Icons)[];

export function IconPicker({ value, onChange, defaultValue }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = iconList.filter((icon) =>
    icon.toLowerCase().includes(search.toLowerCase())
  );

  const SelectedIcon = value ? getIconByName(value) : Smile;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <SelectedIcon className="h-4 w-4" />
          <span className="capitalize">{value || 'Select an icon'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-2">
        <div className="space-y-2">
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
          <ScrollArea className="h-48">
            <div className="grid grid-cols-6 gap-1 p-1">
              {filteredIcons.map((iconName) => {
                const Icon = Icons[iconName as keyof typeof Icons];
                return (
                  <Button
                    key={iconName}
                    variant={value === iconName ? "default" : "outline"}
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => {
                      onChange(iconName);
                      setOpen(false);
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
