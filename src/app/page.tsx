
import { getDocs, collection, query, orderBy, limit } from 'firebase/firestore';
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

async function getFeaturedItems() {
  const items: (Garment & { priority: number })[] = [];
  try {
    const featuredItemsRef = collection(db, 'featuredItems');
    const q = query(featuredItemsRef, orderBy('priority', 'asc'), limit(5));
    const querySnapshot = await getDocs(q);

    // This part is a bit more complex because we need to fetch the actual item data
    // based on the IDs in the featuredItems collection. For this example, we'll
    // assume the featured items collection contains the full garment data.
    // In a real app, you might fetch item details from the 'items' collection.
    
    const itemDocs = await Promise.all(
        querySnapshot.docs.map(doc => getDoc(doc.data().itemRef))
    );

    querySnapshot.forEach((doc) => {
      // For simplicity, we assume featuredItems contains denormalized data
      // or we would fetch it from the 'items' collection using the reference.
      // This implementation will depend on the final Firestore structure.
      // Let's assume for now `featuredItems` has the data we need.
      const data = doc.data();
      items.push({
        id: doc.id,
        name: data.name || 'Featured Item',
        description: data.description || '',
        category: data.category || '',
        suitableOccasions: data.suitableOccasions || '',
        dominantColor: data.dominantColor || '',
        imageUrl: data.imageUrl || 'https://placehold.co/400x600.png',
        style: data.style || '',
        priority: data.priority,
      });
    });

    // If no featured items are found, use some initial data as fallback for display
    if (items.length === 0) {
      return [
        { id: '1', name: 'Classic White Tee', imageUrl: 'https://placehold.co/400x600.png', category: 'Tops', style: 'Classic' },
        { id: '2', name: 'Vintage Blue Jeans', imageUrl: 'https://placehold.co/400x600.png', category: 'Bottoms', style: 'Vintage' },
        { id: '3', name: 'Floral Sundress', imageUrl: 'https://placehold.co/400x600.png', category: 'Dresses', style: 'Bohemian' },
        { id: '4', name: 'Black Blazer', imageUrl: 'https://placehold.co/400x600.png', category: 'Outerwear', style: 'Modern' },
        { id: '5', name: 'Leather Ankle Boots', imageUrl: 'https://placehold.co/400x600.png', category: 'Shoes', style: 'Classic' },
      ].map(item => ({...item, description: '', suitableOccasions: '', dominantColor: ''}));
    }


  } catch (error) {
    console.error("Error fetching featured items: ", error);
    // Return dummy data on error to ensure page renders
     return [
        { id: '1', name: 'Classic White Tee', imageUrl: 'https://placehold.co/400x600.png', category: 'Tops', style: 'Classic' },
        { id: '2', name: 'Vintage Blue Jeans', imageUrl: 'https://placehold.co/400x600.png', category: 'Bottoms', style: 'Vintage' },
        { id: '3', name: 'Floral Sundress', imageUrl: 'https://placehold.co/400x600.png', category: 'Dresses', style: 'Bohemian' },
        { id: '4', name: 'Black Blazer', imageUrl: 'https://placehold.co/400x600.png', category: 'Outerwear', style: 'Modern' },
        { id: '5', name: 'Leather Ankle Boots', imageUrl: 'https://placehold.co/400x600.png', category: 'Shoes', style: 'Classic' },
      ].map(item => ({...item, description: '', suitableOccasions: '', dominantColor: ''}));
  }

  // This part is tricky without a backend call to join data.
  // We will assume `featuredItems` contains all necessary data for now.
  return items.slice(0, 5);
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
                            src={item.imageUrl}
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
