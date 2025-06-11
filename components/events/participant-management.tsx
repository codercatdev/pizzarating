'use client';

import { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, UserMinus, Crown } from 'lucide-react';

interface ParticipantManagementProps {
  event: Event;
  currentUserId: string;
  isEventCreator: boolean;
  onEventUpdate: (updatedEvent: Event) => void;
}

export function ParticipantManagement({ 
  event, 
  currentUserId, 
  isEventCreator, 
  onEventUpdate 
}: ParticipantManagementProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isParticipant = event.participants.includes(currentUserId);

  const handleJoinEvent = async () => {
    if (isParticipant) return;

    try {
      setLoading(true);
      await updateDoc(doc(db, 'events', event.id), {
        participants: arrayUnion(currentUserId)
      });

      const updatedEvent = {
        ...event,
        participants: [...event.participants, currentUserId]
      };
      onEventUpdate(updatedEvent);

      toast({
        title: 'Success!',
        description: 'You have joined the event.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to join event. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!isParticipant || isEventCreator) return;

    try {
      setLoading(true);
      await updateDoc(doc(db, 'events', event.id), {
        participants: arrayRemove(currentUserId)
      });

      const updatedEvent = {
        ...event,
        participants: event.participants.filter(id => id !== currentUserId)
      };
      onEventUpdate(updatedEvent);

      toast({
        title: 'Success!',
        description: 'You have left the event.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to leave event. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Users className="h-5 w-5" />
          Event Participants ({event.participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {event.participants.map((participantId, index) => (
            <Badge 
              key={participantId} 
              variant={participantId === event.createdBy ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {participantId === event.createdBy && (
                <Crown className="h-3 w-3" />
              )}
              {participantId === currentUserId ? 'You' : `Participant ${index + 1}`}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          {!isParticipant && (
            <Button
              onClick={handleJoinEvent}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {loading ? 'Joining...' : 'Join Event'}
            </Button>
          )}

          {isParticipant && !isEventCreator && (
            <Button
              onClick={handleLeaveEvent}
              disabled={loading}
              variant="destructive"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              {loading ? 'Leaving...' : 'Leave Event'}
            </Button>
          )}

          {isEventCreator && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              <Crown className="h-3 w-3 mr-1" />
              Event Creator
            </Badge>
          )}
        </div>

        {!isParticipant && (
          <div className="text-sm text-gray-600 bg-amber-50 p-3 rounded-lg">
            <p>You need to join this event to rate pizzas and participate in the fun!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}