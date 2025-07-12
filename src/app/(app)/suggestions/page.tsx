import { SuggestionClient } from '@/components/suggestions/suggestion-client';

export default function SuggestionsPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="mb-8">
        <h1 className="text-4xl font-headline text-foreground">Outfit Suggestions</h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Let our AI stylist create the perfect outfit for any occasion from your wardrobe.
        </p>
      </header>
      <SuggestionClient />
    </div>
  );
}
