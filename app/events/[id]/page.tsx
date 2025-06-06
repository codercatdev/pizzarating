'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Event, Rating } from '@/lib/types';
import { RatingCard } from '@/components/rating/rating-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Pizza } from 'lucide-react';
import { ratingCriteria } from '@/components/rating/rating-criteria';

export default function EventPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;

      try {
        const eventDoc = await getDoc(doc(db, 'events', id as string));
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() } as Event);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load event details.',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id, toast]);

  if (authLoading || loading) {
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

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-amber-900">Event not found</h1>
      </div>
    );
  }

  const handleRatingChange = (criteriaKey: string, value: number) => {
    setRatings((prev) => ({ ...prev, [criteriaKey]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setSubmitting(true);
      const ratingData: Rating = {
        id: '', // Will be set by Firestore
        eventId: event.id,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        criteria: ratings as Rating['criteria'],
        comments,
      };

      const ratingRef = await addDoc(collection(db, 'ratings'), ratingData);
      await updateDoc(doc(db, 'events', event.id), {
        status: 'in-progress',
      });

      toast({
        title: 'Success!',
        description: 'Your rating has been submitted.',
      });

      router.push('/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit rating. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-amber-900 mb-2">{event.title}</h1>
      <p className="text-gray-600 mb-8">{event.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Object.keys(ratingCriteria).map((criteriaKey) => (
          <RatingCard
            key={criteriaKey}
            criteriaKey={criteriaKey as keyof typeof ratingCriteria}
            value={ratings[criteriaKey] || 5}
            onChange={(value) => handleRatingChange(criteriaKey, value)}
          />
        ))}
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <div className="space-y-2">
          <label htmlFor="comments" className="text-sm font-medium text-gray-700">
            Additional Comments
          </label>
          <Textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Share your thoughts about this pizza..."
            className="min-h-[100px]"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-amber-500 hover:bg-amber-600"
        >
          {submitting ? 'Submitting...' : 'Submit Rating'}
        </Button>
      </div>
    </div>
  );
}