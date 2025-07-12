export interface Garment {
  id: string;
  name: string;
  description: string;
  category: string;
  suitableOccasions: string;
  dominantColor: string;
  imageUrl: string; // The primary image URL
  imageUrls?: string[]; // Array of all image URLs
  style: string;
  availability: boolean;
  approved?: boolean;
  condition?: string;
  size?: string;
  tags?: string;
}

export interface OutfitPlan {
  id: string;
  date: Date;
  outfit: {
    suggestion: string;
    reasoning: string;
  }
}

export interface FirestoreGarment extends Omit<Garment, 'id'>{
  uploader: string;
  timestamp: any; // serverTimestamp
  availability: boolean;
  approved: boolean;
}
