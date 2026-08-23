// app/dashboard/layout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/brand/Logo';
import {
  Home,
  Search,
  FileText,
  Mic,
  Briefcase,
  BookOpen,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Company Research', href: '/dashboard/company-research', icon: Search },
  { name: 'Resume Optimizer', href: '/dashboard/resume-optimizer', icon: FileText },
  { name: 'Mock Interview', href: '/dashboard/mock-interview', icon: Mic },
  { name: 'Applications', href: '/dashboard/applications', icon: Briefcase },
  { name: 'Question Bank', href: '/dashboard/question-bank', icon: BookOpen },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  // Change this to false so sidebar is hidden by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper">
      {/* Top bar with toggle button */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b-[1.5px] border-ink bg-white/90 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle navigation"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/dashboard" aria-label="PrepAI — dashboard" className="text-ink">
            <Logo size="md" />
          </Link>
        </div>

      </div>

      {/* Sidebar - only shows when isSidebarOpen is true */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 border-r-2 border-ink bg-sidebar text-sidebar-foreground transition-transform duration-300',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
            <Link
              href="/dashboard"
              aria-label="PrepAI — dashboard"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Logo variant="onDark" wordmarkClassName="text-sidebar-foreground" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close navigation"
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold transition-colors',
                        isActive
                          ? 'bg-crimson text-white'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section at bottom */}
          <div className="border-t border-sidebar-border p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-sm font-bold text-ink">
                {session?.user?.name?.[0]?.toUpperCase() || 'N'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  {session?.user?.name || 'User'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="pt-16">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
