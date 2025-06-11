import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-amber-900">Your Pizza Events</h1>
        <p className="text-amber-700 mt-1">Manage and track your pizza rating adventures</p>
      </div>
      <Link href="/events/new">
        <Button size="lg">
          Create New Event
        </Button>
      </Link>
    </div>
  );
}