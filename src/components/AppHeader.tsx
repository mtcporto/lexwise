'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/Logo';
import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <SidebarTrigger className="md:hidden" />
      <Link href="/dashboard" className="flex items-center gap-2">
        <Logo className="h-6 w-auto" />
      </Link>
      <div className="flex-1" />
      {/* Future User Profile / Settings can go here */}
    </header>
  );
}
