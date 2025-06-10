'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, addDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Event, Pizza, Rating } from '@/lib/types';
import { RatingCard } from '@/components/rating/rating-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Pizza as PizzaIcon, ArrowLeft } from 'lucide-react';
import { ratingCriteria } from '@/components/rating/rating-criteria';
import Link from 'next/link';

export default function RatePizzaPage() {
  const { id: eventId, pizzaId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [pizza, setPizza] = useState<Pizza | null>(null);
  const [existingRating, setExistingRating] = useState<Rating | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!eventId || !pizzaId || !user) return;

      try {
        // Fetch event
        const eventDoc = await getDoc(doc(db, 'events', eventId as string));
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() } as Event);
        }

        // Fetch pizza
        const pizzaDoc = await getDoc(doc(db, 'pizzas', pizzaId as string));
        if (pizzaDoc.exists()) {
          setPizza({ id: pizzaDoc.id, ...pizzaDoc.data() } as Pizza);
        }

        // Check for existing rating
        const ratingsQuery = query(
          collection(db, 'ratings'),
          where('eventId', '==', eventId),
          where('pizzaId', '==', pizzaId),
          where('userId', '==', user.uid)
        );
        const ratingsSnapshot = await getDocs(ratingsQuery);
        
        if (!ratingsSnapshot.empty) {
          const ratingData = ratingsSnapshot.docs[0].data() as Rating;
          setExistingRating({ id: ratingsSnapshot.docs[0].id, ...ratingData });
          setRatings(ratingData.criteria);
          setComments(ratingData.comments || '');
        } else {
          // Initialize with default ratings
          const defaultRatings: Record<string, number> = {};
          Object.keys(ratingCriteria).forEach(key => {
            defaultRatings[key] = 5;
          });
          setRatings(defaultRatings);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load data.',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [eventId, pizzaId, user, toast]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <PizzaIcon className="h-8 w-8 text-amber-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  if (!event || !pizza) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-amber-900">Pizza not found</h1>
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
      
      if (existingRating) {
        // Update existing rating
        await updateDoc(doc(db, 'ratings', existingRating.id), {
          criteria: ratings as Rating['criteria'],
          comments,
          updatedAt: new Date().toISOString(),
        });
        
        toast({
          title: 'Success!',
          description: 'Your rating has been updated.',
        });
      } else {
        // Create new rating
        const ratingData: Omit<Rating, 'id'> = {
          eventId: event.id,
          pizzaId: pizza.id,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          criteria: ratings as Rating['criteria'],
          comments,
        };

        await addDoc(collection(db, 'ratings'), ratingData);
        
        toast({
          title: 'Success!',
          description: 'Your rating has been submitted.',
        });
      }

      router.push(`/events/${event.id}`);
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
      <div className="mb-6">
        <Link 
          href={`/events/${event.id}`}
          className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Event
        </Link>
        
        <div className="flex items-center gap-3 mb-2">
          <PizzaIcon className="h-8 w-8 text-amber-500" />
          <h1 className="text-3xl font-bold text-amber-900">{pizza.name}</h1>
        </div>
        <p className="text-gray-600 mb-2">{pizza.description}</p>
        <p className="text-sm text-gray-500">Rating for: {event.title}</p>
      </div>

      {pizza.imageUrl && (
        <div className="max-w-md mx-auto mb-8">
          <img
            src={pizza.imageUrl}
            alt={pizza.name}
            className="w-full rounded-lg shadow-md"
          />
        </div>
      )}

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
          {submitting ? 'Submitting...' : existingRating ? 'Update Rating' : 'Submit Rating'}
        </Button>
      </div>
    </div>
  );
}