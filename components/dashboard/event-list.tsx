'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, or } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Event } from '@/lib/types';
import { EventCard } from '@/components/events/event-card';

export function EventList() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      if (!user) return;

      try {
        // Query for events where user is either a participant or the creator
        const eventsQuery = query(
          collection(db, 'events'),
          or(
            where('participants', 'array-contains', user.uid),
            where('createdBy', '==', user.uid)
          )
        );

        const querySnapshot = await getDocs(eventsQuery);
        const eventsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Event));

        // Remove duplicates (in case user is both creator and participant)
        const uniqueEvents = eventsList.filter((event, index, self) => 
          index === self.findIndex(e => e.id === event.id)
        );

        setEvents(uniqueEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to original query if 'or' query fails
        try {
          const fallbackQuery = query(
            collection(db, 'events'),
            where('participants', 'array-contains', user.uid)
          );
          const fallbackSnapshot = await getDocs(fallbackQuery);
          const fallbackEvents = fallbackSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Event));
          setEvents(fallbackEvents);
        } catch (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-48 bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900">No events yet</h3>
        <p className="text-gray-600 mt-1">Create your first pizza rating event to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}