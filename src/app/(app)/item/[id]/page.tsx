'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, addDoc, collection, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import type { Garment, FirestoreGarment } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Handshake, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ItemDetails extends Garment {
  uploaderEmail: string;
  uploaderUid: string;
}

export default function ItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      setLoading(true);

      try {
        const itemRef = doc(db, 'items', id as string);
        const itemSnap = await getDoc(itemRef);

        if (itemSnap.exists()) {
          const itemData = itemSnap.data() as FirestoreGarment;
          let uploaderEmail = 'Unknown';
          
          if (itemData.uploader) {
            const userRef = doc(db, 'users', itemData.uploader);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              uploaderEmail = userSnap.data().email;
            }
          }

          setItem({
            id: itemSnap.id,
            ...itemData,
            uploaderEmail,
            uploaderUid: itemData.uploader,
          } as ItemDetails);
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Item not found.' });
          router.push('/marketplace');
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch item details.' });
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, router, toast]);

  const handleSwapRequest = async () => {
    if (!user || !item) return;
    setActionLoading(true);
    try {
      await addDoc(collection(db, 'swaps'), {
        itemId: item.id,
        requesterUid: user.uid,
        ownerUid: item.uploaderUid,
        status: 'pending',
        timestamp: serverTimestamp(),
      });
      toast({ title: 'Success!', description: 'Swap request sent successfully.' });
    } catch (error) {
      console.error("Error sending swap request:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send swap request.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!user || !item) return;
    setActionLoading(true);

    const pointsToRedeem = 100; // Let's assume a fixed price for now

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid);
        const itemRef = doc(db, 'items', item.id);

        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) {
          throw new Error("User document does not exist!");
        }

        const currentPoints = userDoc.data().points || 0;
        if (currentPoints < pointsToRedeem) {
          throw new Error("You don't have enough points to redeem this item.");
        }

        const newPoints = currentPoints - pointsToRedeem;
        transaction.update(userRef, { points: newPoints });
        transaction.update(itemRef, { availability: false });

        // Update local state to reflect change immediately
        setItem(prev => prev ? { ...prev, availability: false } : null);
      });

      toast({ title: 'Success!', description: `Item redeemed for ${pointsToRedeem} points.` });

    } catch (error: any) {
      console.error("Error redeeming item:", error);
      toast({ variant: 'destructive', title: 'Redemption Failed', description: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center">
        <p>Item not found.</p>
        <Button onClick={() => router.push('/marketplace')} variant="link">Go to Marketplace</Button>
      </div>
    );
  }

  const isOwner = user?.uid === item.uploaderUid;

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2" /> Back
      </Button>
      <Card>
        <div className="grid md:grid-cols-2">
          <CardHeader className="p-0">
            <Image
              src={item.imageUrls?.[0] || 'https://placehold.co/500x700.png'}
              alt={item.name}
              width={500}
              height={700}
              className="object-cover w-full h-full rounded-t-lg md:rounded-l-lg md:rounded-t-none"
            />
          </CardHeader>
          <div className="flex flex-col p-6">
            <CardContent className="flex-grow space-y-4">
              <Badge variant={item.availability ? 'default' : 'destructive'} className="capitalize">
                {item.availability ? 'Available' : 'Unavailable'}
              </Badge>
              <h1 className="text-3xl font-headline text-foreground">{item.name}</h1>
              <p className="text-sm text-muted-foreground">
                Listed by: {item.uploaderEmail}
              </p>
              <p className="text-base leading-relaxed">{item.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Category: {item.category}</Badge>
                <Badge variant="secondary">Style: {item.style}</Badge>
                <Badge variant="secondary">Color: {item.dominantColor}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Suitable for: {item.suitableOccasions}
              </p>
            </CardContent>
            {!isOwner && item.availability && (
              <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row gap-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="lg" disabled={actionLoading}>
                      <Handshake className="mr-2" /> Request Swap
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Swap Request</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will send a notification to the owner to review your swap request. Are you sure you want to proceed?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSwapRequest}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="lg" variant="outline" disabled={actionLoading}>
                      <Star className="mr-2" /> Redeem with 100 Points
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Redemption</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will deduct 100 points from your account and mark the item as yours. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRedeem}>Redeem Now</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
            {isOwner && (
                 <div className="mt-6 pt-6 border-t">
                    <p className="text-muted-foreground text-sm text-center">This is your listing.</p>
                </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
