export interface Garment {
  id: string;
  name: string;
  description: string;
  category: string;
  suitableOccasions: string;
  dominantColor: string;
  imageUrl: string;
  style: string;
  availability: boolean;
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
}
