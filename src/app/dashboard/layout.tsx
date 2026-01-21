'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Providers } from '@/context';
import { Sidebar, Header } from '@/components/dashboard/Navigation';
import { LoadingOverlay } from '@/components/ui/Loading';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/tasks': 'Tasks',
  '/dashboard/profile': 'Profile',
  '/dashboard/settings': 'Settings',
};

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingOverlay message="Loading your dashboard..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const pageTitle = pageTitles[pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} title={pageTitle} />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <DashboardContent>{children}</DashboardContent>
    </Providers>
  );
}
