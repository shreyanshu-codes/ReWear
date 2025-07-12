import type { Garment } from '@/types';

export const initialWardrobe: Garment[] = [
  {
    id: '1',
    name: 'Classic White Tee',
    description: 'A versatile and comfortable short-sleeve t-shirt made from 100% organic cotton.',
    category: 'Tops',
    suitableOccasions: 'Casual, Everyday, Layering',
    dominantColor: 'White',
    imageUrl: 'https://placehold.co/400x600.png',
    style: 'Classic',
  },
  {
    id: '2',
    name: 'Vintage Blue Jeans',
    description: 'High-waisted, straight-leg jeans with a light wash and distressed details for a retro look.',
    category: 'Bottoms',
    suitableOccasions: 'Casual, Weekend, Streetwear',
    dominantColor: 'Blue',
    imageUrl: 'https://placehold.co/400x600.png',
    style: 'Vintage',
  },
  {
    id: '3',
    name: 'Floral Sundress',
    description: 'A light, airy sundress with a delicate floral pattern, perfect for warm weather.',
    category: 'Dresses',
    suitableOccasions: 'Summer, Casual, Garden Party',
    dominantColor: 'Yellow',
    imageUrl: 'https://placehold.co/400x600.png',
    style: 'Bohemian',
  },
  {
    id: '4',
    name: 'Black Blazer',
    description: 'A tailored single-breasted blazer that adds a touch of sophistication to any outfit.',
    category: 'Outerwear',
    suitableOccasions: 'Work, Formal, Smart Casual',
    dominantColor: 'Black',
    imageUrl: 'https://placehold.co/400x600.png',
    style: 'Modern',
  },
    {
    id: '5',
    name: 'Leather Ankle Boots',
    description: 'Stylish and durable leather ankle boots with a low heel, suitable for all seasons.',
    category: 'Shoes',
    suitableOccasions: 'Casual, Work, Evening',
    dominantColor: 'Brown',
    imageUrl: 'https://placehold.co/400x600.png',
    style: 'Classic',
  },
];

export const occasions: string[] = [
    'Casual Day Out',
    'Work Meeting',
    'Date Night',
    'Weekend Brunch',
    'Formal Event',
    'Workout Session',
    'Beach Vacation',
    'Cozy Night In',
];

export const newGarment: Garment = {
    id: '6',
    name: 'Cashmere Sweater',
    description: 'A luxuriously soft cashmere sweater in a warm beige tone, perfect for layering.',
    category: 'Tops',
    suitableOccasions: 'Work, Casual, Evening',
    dominantColor: 'Beige',
    imageUrl: 'https://placehold.co/400x600.png',
    style: 'Classic',
};
