'use client';

import { usePathname } from 'next/navigation';
import { CircleDollarSign } from 'lucide-react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Icons.dashboard },
  { href: '/transactions', label: 'Transactions', icon: Icons.transactions },
  { href: '/budgets', label: 'Budgets', icon: Icons.budgets },
  { href: '/goals', label: 'Goals', icon: Icons.goals },
  { href: '/recurring', label: 'Recurring', icon: Icons.recurring },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="inline-flex items-center gap-2 p-2 font-headline text-lg font-semibold">
          <CircleDollarSign className="h-6 w-6 text-primary" />
          <span className="group-data-[collapsible=icon]:hidden">FinWise</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
              >
                <a href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
