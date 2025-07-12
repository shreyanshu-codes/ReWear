'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shirt, Sparkles, CalendarDays, Home, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'My Wardrobe', icon: LayoutDashboard },
  { href: '/suggestions', label: 'Suggestions', icon: Sparkles },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 p-4 bg-card border-r border-border shrink-0">
      <div className="flex items-center h-16 px-2 mb-4">
        <Logo />
      </div>
      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
        <div className="mt-auto p-2">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={logout}>
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
            </Button>
        </div>
      </TooltipProvider>
    </aside>
  );
}
