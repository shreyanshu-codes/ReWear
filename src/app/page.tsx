import { getDocs, collection, query, orderBy, limit, getDoc, DocumentReference } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Garment } from '@/types';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/logo';

async function getFeaturedItems(): Promise<Garment[]> {
  try {
    const featuredItemsRef = collection(db, 'featuredItems');
    const q = query(featuredItemsRef, orderBy('priority', 'asc'), limit(5));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.log("No featured items found in Firestore. Returning empty array.");
        return []; // Return an empty array instead of throwing an error
    }
    
    const itemPromises = querySnapshot.docs.map(doc => {
        const itemRef = doc.data().itemRef as DocumentReference;
        return getDoc(itemRef);
    });

    const itemDocs = await Promise.all(itemPromises);

    const items = itemDocs.map((doc) => {
        const data = doc.data();
        if (!data) return null;
        return {
            id: doc.id,
            ...data,
        } as Garment;
    }).filter((item): item is Garment => item !== null);

    return items;

  } catch (error) {
    console.error("Error fetching featured items: ", error);
    // Return dummy data on error to ensure page can still render
    return [
        { id: '1', name: 'Classic White Tee', imageUrls: ['https://placehold.co/400x600.png'], category: 'Tops', style: 'Classic' },
        { id: '2', name: 'Vintage Blue Jeans', imageUrls: ['https://placehold.co/400x600.png'], category: 'Bottoms', style: 'Vintage' },
        { id: '3', name: 'Floral Sundress', imageUrls: ['https://placehold.co/400x600.png'], category: 'Dresses', style: 'Bohemian' },
        { id: '4', name: 'Black Blazer', imageUrls: ['https://placehold.co/400x600.png'], category: 'Outerwear', style: 'Modern' },
        { id: '5', name: 'Leather Ankle Boots', imageUrls: ['https://placehold.co/400x600.png'], category: 'Shoes', style: 'Classic' },
    ].map(item => ({...item, description: '', suitableOccasions: '', dominantColor: '', availability: true}));
  }
}


export default async function LandingPage() {
  const featuredItems = await getFeaturedItems();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center p-4 px-6 border-b">
        <Logo />
        <nav>
          <Button asChild variant="ghost">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/20">
          <div className="container px-4 md:px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-4">
              <h1 className="text-4xl font-headline tracking-tighter sm:text-5xl md:text-6xl text-primary">
                Rediscover Your Wardrobe.
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Your personal AI stylist to help you create amazing outfits from the clothes you already own.
              </p>
              <Button asChild size="lg">
                <Link href="/signup">Get Started for Free</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-headline text-center mb-8 sm:mb-12">Featured Items</h2>
            {featuredItems.length > 0 ? (
                <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full max-w-4xl mx-auto"
                >
                <CarouselContent>
                    {featuredItems.map((item) => (
                    <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                            <Image
                                src={item.imageUrls?.[0] || 'https://placehold.co/400x600.png'}
                                alt={item.name}
                                width={400}
                                height={500}
                                className="object-cover w-full aspect-[4/5]"
                                data-ai-hint={`${item.category} ${item.style}`}
                            />
                            </CardContent>
                        </Card>
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
                </Carousel>
            ) : (
                <div className="text-center text-muted-foreground">
                    <p>No featured items to display at the moment. Check back later!</p>
                </div>
            )}
          </div>
        </section>
      </main>

      <footer className="py-6 border-t bg-muted/40">
        <div className="container text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} ReWear. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
