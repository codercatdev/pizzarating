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
  const [authInitialized, setAuthInitialized] = useState(false);

  // First, handle authentication - ensure user is signed in (anonymously if needed)
  useEffect(() => {
    const initializeAuth = async () => {
      if (authLoading) return; // Wait for auth to finish loading
      
      if (!user) {
        // No user signed in, create anonymous user
        try {
          await signInAnonymouslyWithProfile();
        } catch (error) {
          console.error('Failed to create anonymous user:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to create guest account. Please refresh the page.',
          });
        }
      }
      
      setAuthInitialized(true);
    };

    initializeAuth();
  }, [authLoading, user, signInAnonymouslyWithProfile, toast]);

  // Then, fetch event data only after auth is initialized
  useEffect(() => {
    async function fetchEvent() {
      if (!id || !authInitialized || !user) return;

      try {
        setLoading(true);
        const eventDoc = await getDoc(doc(db, 'events', id as string));
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() } as Event);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Event not found.',
          });
        }
      } catch (error) {
        console.error('Error fetching event:', error);
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
  }, [id, authInitialized, user, toast]);

  // Show loading while auth is initializing or event is loading
  if (authLoading || !authInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin">
            <Pizza className="h-8 w-8 text-amber-500 mx-auto" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-amber-900">
              {!authInitialized ? 'Setting up your account...' : 'Loading event...'}
            </h2>
            <p className="text-gray-600 text-sm">
              {!authInitialized ? 'Creating your guest profile' : 'Fetching event details'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no user after auth initialization
  if (!user || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-900 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">Failed to create guest account. Please refresh the page to try again.</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Show error if event not found
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
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