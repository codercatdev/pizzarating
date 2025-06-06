'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { CreateEventForm } from '@/components/events/create-event-form';
import { Pizza } from 'lucide-react';

export default function NewEventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

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
    router.push('/');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-amber-900 mb-8">Create New Pizza Event</h1>
      <CreateEventForm userId={user.uid} />
    </div>
  );
}