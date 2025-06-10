export interface User {
  id: string;
  email: string;
  displayName?: string;
}

export interface Event {
  id: string;
  createdBy: string;
  title: string;
  description: string;
  date: string;
  location: string;
  participants: string[];
  status: 'upcoming' | 'in-progress' | 'completed';
  createdAt: string;
}

export interface Pizza {
  id: string;
  eventId: string;
  name: string;
  description: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
}

export interface Rating {
  id: string;
  eventId: string;
  pizzaId: string;
  userId: string;
  createdAt: string;
  criteria: {
    visualAppeal: number;
    aroma: number;
    sliceStructure: number;
    crustCrispiness: number;
    crustTexture: number;
    crustFlavor: number;
    sauceBalance: number;
    sauceSpread: number;
    cheesePull: number;
    cheeseFlavor: number;
    toppingAmount: number;
    toppingHarmony: number;
    toppingFreshness: number;
  };
  comments: string;
}