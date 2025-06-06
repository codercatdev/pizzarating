'use client';

import { useAuth } from '@/hooks/use-auth';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { EventList } from '@/components/dashboard/event-list';
import { Pizza } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <Pizza className="h-8 w-8 text-amber-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader />
      <EventList />
    </div>
  );
}