// src/app/(app)/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import type { Garment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
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

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({ variant: 'destructive', title: 'Unauthorized', description: 'You do not have permission to view this page.' });
      router.push('/dashboard');
    }
  }, [isAdmin, authLoading, router, toast]);

  const fetchUnapprovedItems = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'items'), where('approved', '==', false));
      const querySnapshot = await getDocs(q);
      const unapprovedItems = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Garment[];
      setItems(unapprovedItems);
    } catch (error) {
      console.error('Error fetching unapproved items:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch items for approval.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUnapprovedItems();
    }
  }, [isAdmin]);

  const handleApprove = async (itemId: string) => {
    try {
      const itemRef = doc(db, 'items', itemId);
      await updateDoc(itemRef, { approved: true });
      toast({ title: 'Success', description: 'Item approved successfully.' });
      fetchUnapprovedItems(); // Refresh list
    } catch (error) {
      console.error('Error approving item:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to approve item.' });
    }
  };

  const handleReject = async (itemId: string) => {
    try {
      // Note: This only deletes the Firestore document.
      // For a full cleanup, you would also need to delete the associated images from Firebase Storage,
      // which requires a more complex setup, often with a Cloud Function.
      const itemRef = doc(db, 'items', itemId);
      await deleteDoc(itemRef);
      toast({ title: 'Success', description: 'Item rejected and removed.' });
      fetchUnapprovedItems(); // Refresh list
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to reject item.' });
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-8">
      <header>
        <h1 className="text-4xl font-headline text-foreground">Admin Panel</h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Review and moderate user-submitted items.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader>
                <div className="aspect-square relative w-full overflow-hidden rounded-md">
                   <Image src={item.imageUrls?.[0] || 'https://placehold.co/400x400.png'} alt={item.name} layout="fill" className="object-cover" />
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
                <p className="text-sm text-muted-foreground">Category: {item.category}</p>
                <p className="text-sm text-muted-foreground">Condition: {item.condition}</p>
              </CardContent>
              <CardContent className="flex justify-end gap-2">
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm"><XCircle className="mr-2 h-4 w-4" />Reject</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the item listing. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleReject(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Confirm Reject
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button onClick={() => handleApprove(item.id)} size="sm"><CheckCircle className="mr-2 h-4 w-4" />Approve</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border text-center min-h-[400px]">
          <div className="p-10">
            <h2 className="text-2xl font-headline tracking-tight">All Clear!</h2>
            <p className="mt-2 text-muted-foreground">
              There are no new items awaiting approval.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
