export interface Garment {
  id: string;
  name: string;
  description: string;
  category: string;
  suitableOccasions: string;
  dominantColor: string;
  imageUrl: string;
  style: string;
}

export interface OutfitPlan {
  id: string;
  date: Date;
  outfit: {
    suggestion: string;
    reasoning: string;
  }
}
