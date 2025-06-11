'use client';

import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, linkWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface AuthFormProps {
  showAnonymousOption?: boolean;
  onAnonymousSignIn?: () => void;
}

export function AuthForm({ showAnonymousOption = true, onAnonymousSignIn }: AuthFormProps) {
  const { toast } = useToast();
  const { user, userProfile, signInAnonymouslyWithProfile, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const googleProvider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      if (user?.isAnonymous) {
        // Link anonymous account with Google
        console.log('Linking anonymous account with Google...');
        const result = await linkWithPopup(user, googleProvider);
        
        // Force refresh the user profile to get updated data
        setTimeout(async () => {
          await refreshUserProfile();
        }, 1000);
        
        toast({
          title: 'Account Upgraded! 🎉',
          description: `Welcome ${result.user.displayName || 'back'}! Your account has been linked with Google and your ratings are now saved permanently.`,
        });
      } else {
        // Regular Google sign-in
        const result = await signInWithPopup(auth, googleProvider);
        toast({
          title: 'Welcome! 🍕',
          description: `Hello ${result.user.displayName || 'Pizza Lover'}! Ready to rate some amazing pizzas?`,
        });
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.code === 'auth/credential-already-in-use') {
        errorMessage = 'This Google account is already linked to another user. Please use a different account or sign in directly.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in directly instead of linking.';
      } else if (error.code === 'auth/provider-already-linked') {
        errorMessage = 'This Google account is already linked to your account.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      setLoading(true);
      await signInAnonymouslyWithProfile();
      toast({
        title: 'Welcome, Pizza Explorer! 🍕',
        description: 'You can start rating pizzas right away! Consider linking with Google to save your ratings permanently.',
      });
      onAnonymousSignIn?.();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create guest account. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>
          {user?.isAnonymous ? 'Upgrade Your Account' : 'Welcome to the Pizza Rating App'}
        </CardTitle>
        <CardDescription>
          {user?.isAnonymous 
            ? `Hi ${userProfile?.displayName}! Link your account with Google to save your ratings permanently and access them from any device.`
            : 'Sign in to start rating pizzas and join events'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          type="button"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={loading}
          variant="default"
        >
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          {loading ? 'Processing...' : (user?.isAnonymous ? 'Link with Google' : 'Sign in with Google')}
        </Button>

        {showAnonymousOption && !user?.isAnonymous && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleAnonymousSignIn}
              disabled={loading}
            >
              Continue as Guest
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}