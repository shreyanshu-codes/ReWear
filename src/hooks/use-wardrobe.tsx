'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Garment, OutfitPlan } from '@/types';
import { initialWardrobe } from '@/lib/data';

interface WardrobeContextType {
  wardrobe: Garment[];
  addGarment: (garment: Garment) => void;
  plannedOutfits: OutfitPlan[];
  addPlannedOutfit: (plan: Omit<OutfitPlan, 'id'>) => void;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider = ({ children }: { children: ReactNode }) => {
  const [wardrobe, setWardrobe] = useState<Garment[]>(initialWardrobe);
  const [plannedOutfits, setPlannedOutfits] = useState<OutfitPlan[]>([]);

  const addGarment = useCallback((garment: Garment) => {
    setWardrobe((prev) => [...prev, { ...garment, id: (prev.length + 1).toString() }]);
  }, []);

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
