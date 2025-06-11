'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  isAnonymous: boolean;
  avatarColor: string;
  createdAt: string;
  upgradedAt?: string; // Track when account was upgraded
  originalAnonymousId?: string; // Keep reference to original anonymous ID
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const generateAvatarColor = () => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const generateRandomUsername = () => {
    const adjectives = ['Cheesy', 'Crispy', 'Saucy', 'Spicy', 'Tasty', 'Zesty', 'Smoky', 'Fresh'];
    const nouns = ['Pizza', 'Slice', 'Crust', 'Topping', 'Cheese', 'Sauce', 'Dough', 'Bite'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    return `${adjective}${noun}${number}`;
  };

  const createUserProfile = async (firebaseUser: User, isUpgrade = false) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // New user - create fresh profile
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || generateRandomUsername(),
          email: firebaseUser.email || undefined,
          isAnonymous: firebaseUser.isAnonymous,
          avatarColor: generateAvatarColor(),
          createdAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), profile);
        return profile;
      } else {
        const existingProfile = { id: userDoc.id, ...userDoc.data() } as UserProfile;
        
        // If this is an upgrade from anonymous to full account
        if (isUpgrade && existingProfile.isAnonymous && !firebaseUser.isAnonymous) {
          console.log('Upgrading anonymous account with IDP data...');
          
          // Overwrite with new account details from IDP
          const upgradedProfile: UserProfile = {
            ...existingProfile, // Keep existing data like createdAt, avatarColor
            displayName: firebaseUser.displayName || existingProfile.displayName,
            email: firebaseUser.email || existingProfile.email,
            isAnonymous: false, // No longer anonymous
            upgradedAt: new Date().toISOString(),
            originalAnonymousId: existingProfile.uid, // Keep reference to original
          };

          // Update the profile in Firestore
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            displayName: upgradedProfile.displayName,
            email: upgradedProfile.email,
            isAnonymous: false,
            upgradedAt: upgradedProfile.upgradedAt,
            originalAnonymousId: upgradedProfile.originalAnonymousId,
          });

          console.log('Account upgraded successfully:', {
            from: existingProfile.displayName,
            to: upgradedProfile.displayName,
            email: upgradedProfile.email
          });

          return upgradedProfile;
        }
        
        return existingProfile;
      }
    } catch (error) {
      console.error('Error creating/fetching user profile:', error);
      // Return a basic profile if Firestore fails
      return {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || generateRandomUsername(),
        email: firebaseUser.email || undefined,
        isAnonymous: firebaseUser.isAnonymous,
        avatarColor: generateAvatarColor(),
        createdAt: new Date().toISOString(),
      };
    }
  };

  const signInAnonymouslyWithProfile = async () => {
    try {
      const result = await signInAnonymously(auth);
      const profile = await createUserProfile(result.user);
      setUserProfile(profile);
      return { user: result.user, profile };
    } catch (error) {
      console.error('Anonymous sign-in failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Check if this is an account upgrade (was anonymous, now has provider)
          const wasAnonymous = userProfile?.isAnonymous === true;
          const isNowLinked = !firebaseUser.isAnonymous && firebaseUser.providerData.length > 0;
          const isUpgrade = wasAnonymous && isNowLinked;
          
          if (isUpgrade) {
            console.log('Detected account upgrade from anonymous to linked account');
          }
          
          const profile = await createUserProfile(firebaseUser, isUpgrade);
          setUserProfile(profile);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        // Set user even if profile creation fails
        setUser(firebaseUser);
        if (firebaseUser) {
          setUserProfile({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || generateRandomUsername(),
            email: firebaseUser.email || undefined,
            isAnonymous: firebaseUser.isAnonymous,
            avatarColor: generateAvatarColor(),
            createdAt: new Date().toISOString(),
          });
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [userProfile?.isAnonymous]); // Add dependency to detect anonymous state changes

  return { 
    user, 
    userProfile, 
    loading, 
    signInAnonymouslyWithProfile 
  };
}