'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Pizza, Rating } from '@/lib/types';
import { PizzaCard } from './pizza-card';
import { AddPizzaForm } from './add-pizza-form';
import { useAuth } from '@/hooks/use-auth';

interface PizzaListProps {
  eventId: string;
  isEventCreator: boolean;
}

export function PizzaList({ eventId, isEventCreator }: PizzaListProps) {
  const { user } = useAuth();
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch pizzas
      const pizzasQuery = query(
        collection(db, 'pizzas'),
        where('eventId', '==', eventId)
      );
      const pizzasSnapshot = await getDocs(pizzasQuery);
      const pizzasList = pizzasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Pizza));

      // Fetch ratings
      const ratingsQuery = query(
        collection(db, 'ratings'),
        where('eventId', '==', eventId)
      );
      const ratingsSnapshot = await getDocs(ratingsQuery);
      const ratingsList = ratingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Rating));

      setPizzas(pizzasList);
      setRatings(ratingsList);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const getUserRating = (pizzaId: string) => {
    if (!user) return undefined;
    const userRating = ratings.find(r => r.pizzaId === pizzaId && r.userId === user.uid);
    if (!userRating) return undefined;
    
    // Calculate average of all criteria
    const criteriaValues = Object.values(userRating.criteria);
    return criteriaValues.reduce((sum, val) => sum + val, 0) / criteriaValues.length;
  };

  const getAverageRating = (pizzaId: string) => {
    const pizzaRatings = ratings.filter(r => r.pizzaId === pizzaId);
    if (pizzaRatings.length === 0) return undefined;
    
    const totalScore = pizzaRatings.reduce((sum, rating) => {
      const criteriaValues = Object.values(rating.criteria);
      const avgCriteria = criteriaValues.reduce((s, v) => s + v, 0) / criteriaValues.length;
      return sum + avgCriteria;
    }, 0);
    
    return totalScore / pizzaRatings.length;
  };

  const getTotalRatings = (pizzaId: string) => {
    return ratings.filter(r => r.pizzaId === pizzaId).length;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pizzas.map((pizza) => (
          <PizzaCard
            key={pizza.id}
            pizza={pizza}
            eventId={eventId}
            userRating={getUserRating(pizza.id)}
            averageRating={getAverageRating(pizza.id)}
            totalRatings={getTotalRatings(pizza.id)}
            canRate={!!user} // All participants (including creators) can rate
          />
        ))}
        
        {isEventCreator && user && (
          <AddPizzaForm
            eventId={eventId}
            userId={user.uid}
            onSuccess={fetchData}
          />
        )}
      </div>

      {pizzas.length === 0 && !isEventCreator && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900">No pizzas added yet</h3>
          <p className="text-gray-600 mt-1">The event creator will add pizzas for rating soon!</p>
        </div>
      )}
    </div>
  );
}