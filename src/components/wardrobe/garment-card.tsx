import Image from 'next/image';
import type { Garment } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GarmentCardProps {
  garment: Garment;
}

export function GarmentCard({ garment }: GarmentCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Image
          src={garment.imageUrl}
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
}
