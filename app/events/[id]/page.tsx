'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Pizza, Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { PizzaList } from '@/components/pizzas/pizza-list';
import { ParticipantManagement } from '@/components/events/participant-management';
import { EventJoinRequest } from '@/components/events/event-join-request';

export default function EventPage() {
  const { id } = useParams();
  const { user, userProfile, loading: authLoading, signInAnonymouslyWithProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Auto sign-in anonymously when user visits event page without being logged in
  useEffect(() => {
    if (!authLoading && !user && event) {
      handleAnonymousSignIn();
    }
  }, [authLoading, user, event]);

  const handleAnonymousSignIn = async () => {
    try {
      await signInAnonymouslyWithProfile();
    } catch (error) {
      console.error('Auto anonymous sign-in failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create guest account. Please refresh the page.',
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <Pizza className="h-8 w-8 text-amber-500" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-amber-900">Event not found</h1>
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-900 mb-4">Loading...</h1>
          <p className="text-gray-600">Setting up your guest account...</p>
        </div>
      </div>
    );
  }

  const isEventCreator = event.createdBy === user.uid;
  const isParticipant = event.participants.includes(user.uid);
  const hasPendingRequest = event.pendingRequests?.includes(user.uid) || false;

  const handleEventUpdate = (updatedEvent: Event) => {
    setEvent(updatedEvent);
  };

  // Show limited view for non-participants
  if (!isParticipant && !isEventCreator) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <Pizza className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-amber-900 mb-4">{event.title}</h1>
            
            <div className="max-w-md mx-auto space-y-4">
              <p className="text-gray-600">
                This is a private pizza rating event. You'll need to join to see the pizzas and participate in the ratings.
              </p>
              
              <EventJoinRequest
                event={event}
                currentUserId={user.uid}
                userProfile={userProfile}
                hasPendingRequest={hasPendingRequest}
                onEventUpdate={handleEventUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full event view for participants
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          href="/dashboard"
          className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-3xl font-bold text-amber-900 mb-4">{event.title}</h1>
          <p className="text-gray-600 mb-6">{event.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-3 text-amber-500" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-sm">{format(new Date(event.date), 'PPP p')}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-3 text-amber-500" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-3 text-amber-500" />
              <div>
                <p className="font-medium">Participants</p>
                <p className="text-sm">{event.participants.length} people</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              event.status === 'completed' ? 'bg-green-100 text-green-800' :
              event.status === 'in-progress' ? 'bg-amber-100 text-amber-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <ParticipantManagement
          event={event}
          currentUserId={user.uid}
          isEventCreator={isEventCreator}
          onEventUpdate={handleEventUpdate}
        />
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-amber-900 mb-4">
          Pizza Collection
        </h2>
        <p className="text-gray-600">
          {isEventCreator 
            ? 'Add pizzas and rate them alongside your participants!' 
            : 'Rate each pizza based on the different criteria.'
          }
        </p>
      </div>

      <PizzaList eventId={event.id} isEventCreator={isEventCreator} />
    </div>
  );
}