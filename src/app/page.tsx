'use client';

import { useWardrobe } from '@/hooks/use-wardrobe';
import { GarmentCard } from '@/components/wardrobe/garment-card';
import { AddGarmentSheet } from '@/components/wardrobe/add-garment-sheet';

export default function WardrobePage() {
  const { wardrobe } = useWardrobe();

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-headline text-foreground">My Wardrobe</h1>
        <AddGarmentSheet />
      </header>
      {wardrobe.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {wardrobe.map((garment) => (
            <GarmentCard key={garment.id} garment={garment} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border text-center">
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
  );
}
