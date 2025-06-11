'use client';

import { useAuth } from '@/hooks/use-auth';
import { AuthForm } from '@/components/auth/auth-form';
import { Pizza } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <Pizza className="h-8 w-8 text-amber-500" />
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Pizza className="h-12 w-12 text-amber-500 mr-2" />
          <h1 className="text-4xl font-bold text-amber-900">Pizza Rating App</h1>
        </div>
        <p className="text-amber-700 text-lg">Rate and share your pizza experiences with friends!</p>
      </div>

      <AuthForm />
    </main>
  );
}