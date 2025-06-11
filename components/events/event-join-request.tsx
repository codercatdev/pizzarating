'use client';

import { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/hooks/use-auth';
import { AuthForm } from '@/components/auth/auth-form';
import { UserPlus, Clock, CheckCircle, LinkIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface EventJoinRequestProps {
  event: Event;
  currentUserId: string;
  userProfile: UserProfile;
  hasPendingRequest: boolean;
  onEventUpdate: (updatedEvent: Event) => void;
}

export function EventJoinRequest({ 
  event, 
  currentUserId, 
  userProfile,
  hasPendingRequest,
  onEventUpdate 
}: EventJoinRequestProps) {
  const [loading, setLoading] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { toast } = useToast();

  const handleJoinRequest = async () => {
    if (hasPendingRequest) return;

    try {
      setLoading(true);
      
      // Add user to pending requests
      await updateDoc(doc(db, 'events', event.id), {
        pendingRequests: arrayUnion(currentUserId)
      });

      const updatedEvent = {
        ...event,
        pendingRequests: [...(event.pendingRequests || []), currentUserId]
      };
      onEventUpdate(updatedEvent);

      toast({
        title: 'Request Sent!',
        description: 'The event creator will be notified of your request to join.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send join request. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Join Request Section */}
      <Card className="border-amber-200">
        <CardHeader className="text-center">
          <CardTitle className="text-lg text-amber-900">Join This Event</CardTitle>
          <CardDescription>
            Request access to participate in pizza ratings
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {!hasPendingRequest ? (
            <Button
              onClick={handleJoinRequest}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600"
              size="lg"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {loading ? 'Sending Request...' : 'Request to Join'}
            </Button>
          ) : (
            <div className="space-y-2">
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                <Clock className="h-3 w-3 mr-1" />
                Request Pending
              </Badge>
              <p className="text-sm text-gray-600">
                Your join request has been sent to the event creator. You'll be notified when it's approved.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Upgrade Prompt for Anonymous Users */}
      {userProfile.isAnonymous && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="text-center">
            <CardTitle className="text-lg text-blue-900 flex items-center justify-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Upgrade Your Account
            </CardTitle>
            <CardDescription className="text-blue-700">
              Link with Google to save your ratings permanently
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Access your ratings from any device</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Never lose your pizza rating history</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Get notified about new events</span>
              </div>
            </div>

            <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Link with Google
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upgrade Your Account</DialogTitle>
                  <DialogDescription>
                    Link your guest account with Google to save your ratings permanently 
                    and access them from any device.
                  </DialogDescription>
                </DialogHeader>
                <AuthForm 
                  showAnonymousOption={false} 
                  onAnonymousSignIn={() => setShowUpgradeDialog(false)}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Guest User Info */}
      <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <p>
          <strong>Currently signed in as:</strong> {userProfile.displayName}
          {userProfile.isAnonymous && (
            <Badge variant="secondary" className="ml-2">Guest</Badge>
          )}
        </p>
      </div>
    </div>
  );
}