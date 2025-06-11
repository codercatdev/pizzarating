'use client';

import { Pizza } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pizza as PizzaIcon, Star } from 'lucide-react';
import Link from 'next/link';

interface PizzaCardProps {
  pizza: Pizza;
  eventId: string;
  userRating?: number;
  averageRating?: number;
  totalRatings?: number;
  canRate?: boolean;
}

export function PizzaCard({
  pizza,
  eventId,
  userRating,
  averageRating,
  totalRatings = 0,
  canRate = false
}: PizzaCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-amber-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl text-amber-900 flex items-center gap-2">
            <PizzaIcon className="h-5 w-5 text-amber-500" />
            {pizza.name}
          </CardTitle>
          {averageRating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{averageRating.toFixed(1)}</span>
              <span className="text-gray-500">({totalRatings})</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pizza.imageUrl && (
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img
              src={pizza.imageUrl}
              alt={pizza.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <p className="text-gray-600 text-sm leading-relaxed">{pizza.description}</p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            {userRating && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Your Rating: {parseFloat(userRating.toFixed(1))}/10
              </Badge>
            )}
          </div>

          {canRate && (
            <Link href={`/events/${eventId}/pizzas/${pizza.id}/rate`}>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
                {userRating ? 'Update Rating' : 'Rate Pizza'}
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}