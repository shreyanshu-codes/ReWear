// src/app/(app)/marketplace/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import type { Garment } from '@/types';
import { GarmentCard } from '@/components/wardrobe/garment-card';
import { Loader2 } from 'lucide-react';

export default function MarketplacePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'items'),
          where('uploader', '!=', user.uid),
          where('availability', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const marketplaceItems = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Garment[];
        setItems(marketplaceItems);
      } catch (error) {
        console.error('Error fetching marketplace items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [user]);

  return (
    <div className="flex flex-col h-full gap-8">
      <header>
        <h1 className="text-4xl font-headline text-foreground">Marketplace</h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Browse and swap items from other users' wardrobes.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-lg font-medium">Loading items...</p>
            </div>
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map(item => (
            <GarmentCard key={item.id} garment={item} isLink />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border text-center min-h-[400px]">
          <div className="p-10">
            <h2 className="text-2xl font-headline tracking-tight">The Marketplace is Quiet</h2>
            <p className="mt-2 text-muted-foreground">
              There are currently no items available from other users.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
