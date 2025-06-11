'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  isAnonymous: boolean;
  avatarColor: string;
  createdAt: string;
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

  const createUserProfile = async (firebaseUser: User) => {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
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
      return { id: userDoc.id, ...userDoc.data() } as UserProfile;
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
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profile = await createUserProfile(firebaseUser);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error creating/fetching user profile:', error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { 
    user, 
    userProfile, 
    loading, 
    signInAnonymouslyWithProfile 
  };
}