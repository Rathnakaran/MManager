import {
  LayoutDashboard,
  ArrowRightLeft,
  PiggyBank,
  Target,
  Repeat,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  PlusCircle,
  FileUp,
  FileDown,
  Search,
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Ticket,
  HeartPulse,
  ShoppingBag,
  Landmark,
  CircleDollarSign,
  type LucideIcon,
} from 'lucide-react';

export type IconName =
  | 'LayoutDashboard'
  | 'ArrowRightLeft'
  | 'PiggyBank'
  | 'Target'
  | 'Repeat'
  | 'ShoppingCart'
  | 'Utensils'
  | 'Car'
  | 'Home'
  | 'Ticket'
  | 'HeartPulse'
  | 'ShoppingBag'
  | 'Landmark'
  | 'CircleDollarSign';


export const Icons = {
  dashboard: LayoutDashboard,
  transactions: ArrowRightLeft,
  budgets: PiggyBank,
  goals: Target,
  recurring: Repeat,
  down: ChevronDown,
  up: ChevronUp,
  more: MoreHorizontal,
  add: PlusCircle,
  import: FileUp,
  export: FileDown,
  search: Search,
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Ticket,
  HeartPulse,
  ShoppingBag,
  Landmark,
  CircleDollarSign
};

const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    ArrowRightLeft,
    PiggyBank,
    Target,
    Repeat,
    ShoppingCart,
    Utensils,
    Car,
    Home,
    Ticket,
    HeartPulse,
    ShoppingBag,
    Landmark,
    CircleDollarSign
};

export const getIconByName = (name: string): LucideIcon => {
    const Icon = iconMap[name];
    return Icon || CircleDollarSign;
};
