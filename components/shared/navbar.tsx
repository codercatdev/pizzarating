'use client';

import { useAuth } from '@/hooks/use-auth';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { UserAvatar } from './user-avatar';
import { AuthForm } from '@/components/auth/auth-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { Settings, LogOut, LinkIcon, Crown } from 'lucide-react';

export function Navbar() {
  const { user, userProfile } = useAuth();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const isUpgradedAccount = userProfile?.upgradedAt && !userProfile?.isAnonymous;

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />
        
        {user && userProfile && (
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/events/new">
              <Button>New Event</Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <UserAvatar size="md" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <UserAvatar size="sm" showName showUpgradeStatus />
                </div>
                <DropdownMenuSeparator />
                
                {userProfile.isAnonymous && (
                  <>
                    <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                      <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <LinkIcon className="mr-2 h-4 w-4" />
                          <span>Upgrade Account</span>
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upgrade Your Account</DialogTitle>
                          <DialogDescription>
                            Link your guest account with Google to save your ratings permanently 
                            and access them from any device. Your current username "{userProfile.displayName}" 
                            will be updated with your Google profile information.
                          </DialogDescription>
                        </DialogHeader>
                        <AuthForm 
                          showAnonymousOption={false} 
                          onAnonymousSignIn={() => setShowUpgradeDialog(false)}
                        />
                      </DialogContent>
                    </Dialog>
                    <DropdownMenuSeparator />
                  </>
                )}

                {isUpgradedAccount && (
                  <>
                    <DropdownMenuItem disabled>
                      <Crown className="mr-2 h-4 w-4 text-amber-500" />
                      <span className="text-green-600">Account Upgraded!</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  );
}