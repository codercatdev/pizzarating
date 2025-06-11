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
import { Settings, LogOut, LinkIcon, User } from 'lucide-react';

export function Navbar() {
  const { user, userProfile } = useAuth();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
  };

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
                  <UserAvatar size="sm" />
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile.displayName}</p>
                    {userProfile.email ? (
                      <p className="text-xs leading-none text-muted-foreground">
                        {userProfile.email}
                      </p>
                    ) : (
                      <p className="text-xs leading-none text-muted-foreground">
                        Guest User
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Manage Profile</span>
                  </DropdownMenuItem>
                </Link>

                {userProfile.isAnonymous && (
                  <>
                    <DropdownMenuSeparator />
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
                  </>
                )}

                <DropdownMenuSeparator />
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