import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Search, FileText, ShieldAlert, MessagesSquare } from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  matchSegments?: number; // Number of path segments to match for active state
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    matchSegments: 1,
  },
  {
    href: '/search',
    label: 'Pesquisa Unificada',
    icon: Search,
    matchSegments: 1,
  },
  {
    href: '/case-analyzer',
    label: 'Analisador de Caso',
    icon: FileText,
    matchSegments: 1,
  },
  {
    href: '/counterargument-predictor',
    label: 'Preditor de Contra-Argumentos',
    icon: MessagesSquare, // Using MessagesSquare as ShieldAlert might be too aggressive.
    matchSegments: 1,
  },
];
