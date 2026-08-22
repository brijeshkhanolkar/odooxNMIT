'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { cn } from '@/lib/utils';
import type { ProfileWithRole } from '@/lib/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  profile: ProfileWithRole;
}

export function DashboardLayout({ children, profile }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        role={profile.role.name}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'ml-[72px]' : 'ml-64'
        )}
      >
        <Header profile={profile} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
