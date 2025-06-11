'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserAvatar } from '@/components/shared/user-avatar';
import { AuthForm } from '@/components/auth/auth-form';
import { Pizza, ArrowLeft, Save, Palette, LinkIcon, Crown, Mail, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

const avatarColors = [
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Teal', value: 'bg-teal-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Cyan', value: 'bg-cyan-500' },
];

export default function ProfilePage() {
  const { user, userProfile, loading, updateUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');
  const [saving, setSaving] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Update form values when userProfile changes (including real-time updates)
  useEffect(() => {
    if (userProfile) {
      console.log('Updating form with profile data:', userProfile);
      setDisplayName(userProfile.displayName || '');
      setSelectedColor(userProfile.avatarColor || 'bg-blue-500');
    }
  }, [userProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <Pizza className="h-8 w-8 text-amber-500" />
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    router.push('/');
    return null;
  }

  const handleSave = async () => {
    if (!user || !userProfile) return;

    try {
      setSaving(true);
      
      await updateUserProfile({
        displayName: displayName.trim(),
        avatarColor: selectedColor,
      });

      toast({
        title: 'Profile Updated! 🎉',
        description: 'Your profile changes have been saved successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(userProfile.displayName || '');
    setSelectedColor(userProfile.avatarColor || 'bg-blue-500');
  };

  const hasChanges = displayName !== userProfile.displayName || selectedColor !== userProfile.avatarColor;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link 
          href="/dashboard"
          className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="flex items-center gap-4 mb-6">
          <UserAvatar size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-amber-900">Profile Management</h1>
            <p className="text-amber-700">Customize your pizza rating profile</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  maxLength={50}
                />
                <p className="text-sm text-gray-500">
                  This is how other participants will see you in events
                </p>
              </div>

              <div className="space-y-3">
                <Label>Avatar Color</Label>
                <div className="grid grid-cols-5 gap-3">
                  {avatarColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`
                        w-12 h-12 rounded-full ${color.value} 
                        border-4 transition-all duration-200
                        ${selectedColor === color.value 
                          ? 'border-amber-500 scale-110 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                        }
                      `}
                      title={color.name}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Choose a color for your avatar background
                </p>
              </div>

              {hasChanges && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={handleSave}
                    disabled={saving || !displayName.trim()}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Upgrade */}
          {userProfile.isAnonymous && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <LinkIcon className="h-5 w-5" />
                  Upgrade Your Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-blue-700">
                  You're currently using a guest account. Link with Google to:
                </p>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Save your ratings permanently
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Access your account from any device
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Get your real name and profile photo
                  </li>
                </ul>

                <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-500 hover:bg-blue-600">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Link with Google
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upgrade Your Account</DialogTitle>
                      <DialogDescription>
                        Link your guest account with Google to save your ratings permanently 
                        and access them from any device. Your profile will be updated with 
                        your Google account information.
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
        </div>

        {/* Account Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Account Type</p>
                    <div className="flex items-center gap-2">
                      {userProfile.isAnonymous ? (
                        <Badge variant="secondary">Guest Account</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <Crown className="h-3 w-3 mr-1" />
                          Linked Account
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {userProfile.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-600">{userProfile.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(userProfile.createdAt), 'PPP')}
                    </p>
                  </div>
                </div>

                {userProfile.upgradedAt && (
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium">Account Upgraded</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(userProfile.upgradedAt), 'PPP')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Live Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-full ${selectedColor} flex items-center justify-center text-white font-semibold`}>
                  {displayName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </div>
                <div>
                  <p className="font-medium">{displayName || 'Your Name'}</p>
                  <p className="text-sm text-gray-500">
                    {userProfile.isAnonymous ? 'Guest User' : 'Linked Account'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This is how you'll appear to other participants
              </p>
              {hasChanges && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                  ✨ You have unsaved changes
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}