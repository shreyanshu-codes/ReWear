'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Garment, OutfitPlan } from '@/types';
import { useAuth } from './use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

interface WardrobeContextType {
  wardrobe: Garment[];
  addGarment: (garment: Omit<Garment, 'id' | 'uploader'>) => Promise<void>;
  plannedOutfits: OutfitPlan[];
  addPlannedOutfit: (plan: Omit<OutfitPlan, 'id'>) => void;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [wardrobe, setWardrobe] = useState<Garment[]>([]);
  const [plannedOutfits, setPlannedOutfits] = useState<OutfitPlan[]>([]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'items'), where('uploader', '==', user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userWardrobe: Garment[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          userWardrobe.push({
            id: doc.id,
            // We assume the data from Firestore matches the Garment type
            name: data.name || '',
            description: data.description || '',
            category: data.category || '',
            suitableOccasions: data.suitableOccasions || '',
            dominantColor: data.dominantColor || '',
            imageUrl: data.imageUrl || '',
            style: data.style || '',
            // a uploader field is not part of Garment, so we omit it
          });
        });
        setWardrobe(userWardrobe);
      });

      return () => unsubscribe();
    } else {
      setWardrobe([]);
    }
  }, [user]);

  const addGarment = useCallback(async (garment: Omit<Garment, 'id' | 'uploader'>) => {
    if (!user) {
      throw new Error('You must be logged in to add a garment.');
    }
    await addDoc(collection(db, 'items'), {
      ...garment,
      uploader: user.uid,
      timestamp: serverTimestamp(),
      availability: true, // Default availability
    });
  }, [user]);

  const addPlannedOutfit = useCallback((plan: Omit<OutfitPlan, 'id'>) => {
    setPlannedOutfits((prev) => [...prev, { ...plan, id: new Date().toISOString() }]);
  }, []);

  return (
    <WardrobeContext.Provider value={{ wardrobe, addGarment, plannedOutfits, addPlannedOutfit }}>
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = () => {
  const context = useContext(WardrobeContext);
  if (context === undefined) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
};
