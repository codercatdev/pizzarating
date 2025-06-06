import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ratingCriteria } from './rating-criteria';

interface RatingCardProps {
  criteriaKey: keyof typeof ratingCriteria;
  value: number;
  onChange: (value: number) => void;
}

export function RatingCard({ criteriaKey, value, onChange }: RatingCardProps) {
  const criteria = ratingCriteria[criteriaKey];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg text-amber-900">{criteria.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{criteria.description}</p>
        <div className="space-y-4">
          <Slider
            value={[value]}
            min={criteria.min}
            max={criteria.max}
            step={1}
            onValueChange={(values) => onChange(values[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{criteria.labels[0]}</span>
            <span>{criteria.labels[1]}</span>
          </div>
          <div className="text-center text-lg font-semibold text-amber-600">
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}