'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { NAV_ITEMS, type NavItem } from '@/lib/constants';
import { Logo } from '@/components/icons/Logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.matchSegments) {
      const pathSegments = pathname.split('/').filter(Boolean);
      const itemSegments = item.href.split('/').filter(Boolean);
      if (pathSegments.length < item.matchSegments || itemSegments.length < item.matchSegments) {
        return false;
      }
      for (let i = 0; i < item.matchSegments; i++) {
        if (pathSegments[i] !== itemSegments[i]) {
          return false;
        }
      }
      return true;
    }
    return pathname === item.href;
  };

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Logo className="h-7 w-auto group-data-[collapsible=icon]:h-8" />
          <span className="text-xl font-semibold group-data-[collapsible=icon]:hidden">LexWise</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item)}
                className={cn(
                  'justify-start group-data-[collapsible=icon]:justify-center',
                  isActive(item) && 'bg-primary/10 text-primary hover:bg-primary/15'
                )}
                tooltip={{ children: item.label, className: "capitalize" }}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        {/* Placeholder for future actions or user info */}
         <SidebarMenuButton 
            variant="ghost" 
            className="w-full justify-start group-data-[collapsible=icon]:justify-center"
            tooltip={{ children: "Sair", className: "capitalize" }}
          >
          <LogOut className="h-5 w-5" />
          <span className="group-data-[collapsible=icon]:hidden">Sair</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
