'use client';

import { useEffect, useState } from 'react';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { useAuth } from '@/hooks/use-auth';
import { GarmentCard } from '@/components/wardrobe/garment-card';
import { AddGarmentSheet } from '@/components/wardrobe/add-garment-sheet';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import type { Garment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake, Repeat, Star } from 'lucide-react';
import Link from 'next/link';

export default function WardrobePage() {
  const { wardrobe } = useWardrobe();
  const { user } = useAuth();
  const [points, setPoints] = useState<number>(0);
  const [swaps, setSwaps] = useState({ pending: 0, completed: 0 });

  useEffect(() => {
    if (user) {
      // Fetch user points
      const userDocRef = doc(db, 'users', user.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          setPoints(docSnap.data().points || 0);
        }
      });

      // Fetch user's item IDs
      const getMyItemIds = async () => {
        const itemsQuery = query(collection(db, 'items'), where('uploader', '==', user.uid));
        const itemsSnapshot = await getDocs(itemsQuery);
        return itemsSnapshot.docs.map(doc => doc.id);
      }
      
      // Fetch swaps
      const fetchSwaps = async () => {
        const myItemIds = await getMyItemIds();
        
        const swapsQueryRequester = query(collection(db, 'swaps'), where('requesterUid', '==', user.uid));
        const swapsQueryOwner = query(collection(db, 'swaps'), where('itemId', 'in', myItemIds.length > 0 ? myItemIds : ['dummyId']));
        
        const [requesterSwaps, ownerSwaps] = await Promise.all([
          getDocs(swapsQueryRequester),
          getDocs(swapsQueryOwner),
        ]);
        
        const allSwaps = [...requesterSwaps.docs, ...ownerSwaps.docs].reduce((acc, doc) => {
            if(!acc.has(doc.id)){
                acc.set(doc.id, doc.data());
            }
            return acc;
        }, new Map());


        let pending = 0;
        let completed = 0;

        allSwaps.forEach(swap => {
          if (swap.status === 'pending') pending++;
          if (swap.status === 'completed') completed++;
        });

        setSwaps({ pending, completed });
      };

      fetchSwaps();
    }
  }, [user]);

  return (
    <div className="flex flex-col h-full gap-8">
      <header>
        <h1 className="text-4xl font-headline text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Welcome back! Here's a snapshot of your wardrobe and activity.
        </p>
      </header>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Points</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{points}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Swaps</CardTitle>
            <Handshake className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{swaps.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Swaps</CardTitle>
            <Repeat className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{swaps.completed}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-headline text-foreground">My Wardrobe</h2>
            <AddGarmentSheet />
        </div>
        {wardrobe.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {wardrobe.map((garment) => (
              <GarmentCard key={garment.id} garment={garment} isLink />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border text-center min-h-[400px]">
              <div className="p-10">
                  <h2 className="text-2xl font-headline tracking-tight">Your wardrobe is empty</h2>
                  <p className="mt-2 text-muted-foreground">Add your first clothing item to get started.</p>
                  <div className="mt-6">
                      <AddGarmentSheet />
                  </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}
