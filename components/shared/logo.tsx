'use client';

import { Pizza } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Pizza className="h-8 w-8 text-amber-500" />
      <span className="text-2xl font-bold text-amber-900">Pizzazzle</span>
    </Link>
  );
}