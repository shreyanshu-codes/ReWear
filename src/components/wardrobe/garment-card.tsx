import Image from 'next/image';
import type { Garment } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface GarmentCardProps {
  garment: Garment;
  isLink?: boolean;
}

export function GarmentCard({ garment, isLink = false }: GarmentCardProps) {
  const cardContent = (
    <Card className="overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
      <CardHeader className="p-0 relative">
        <Image
          src={garment.imageUrls?.[0] || 'https://placehold.co/400x600.png'}
          alt={garment.name}
          width={400}
          height={600}
          className="object-cover w-full aspect-[4/5] transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={`${garment.category} ${garment.style}`}
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <h3 className="font-headline text-lg leading-tight truncate">{garment.name}</h3>
        <p className="text-sm text-muted-foreground">{garment.category}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
         <Badge variant="secondary" className="font-normal">{garment.style}</Badge>
      </CardFooter>
    </Card>
  );

  if (isLink) {
    return (
      <Link href={`/item/${garment.id}`} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
