export interface Garment {
  id: string;
  name: string;
  description: string;
  category: string;
  suitableOccasions: string;
  dominantColor: string;
  imageUrls: string[]; // Array of all image URLs
  style: string;
  availability: boolean;
  approved?: boolean;
  condition?: string;
  size?: string;
  tags?: string;
  uploader?: string; // Add uploader UID to the base Garment type
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
