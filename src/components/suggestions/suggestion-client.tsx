'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Loader2 } from 'lucide-react';

import { useWardrobe } from '@/hooks/use-wardrobe';
import { suggestOutfit, type SuggestOutfitOutput } from '@/ai/flows/suggest-outfit';
import { occasions } from '@/lib/data';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  occasion: z.string().min(1, 'Please select an occasion.'),
});

type FormValues = z.infer<typeof formSchema>;

export function SuggestionClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestOutfitOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { wardrobe } = useWardrobe();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setSuggestion(null);
    setError(null);

    const wardrobeDescription = wardrobe
      .map((item) => `${item.name}: ${item.description} (Style: ${item.style}, Color: ${item.dominantColor})`)
      .join('\n');

    try {
      const result = await suggestOutfit({
        wardrobeDescription,
        occasion: data.occasion,
      });
      setSuggestion(result);
    } catch (err) {
      setError('Failed to get suggestion. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate an outfit suggestion at this time.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="occasion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">What's the occasion?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an occasion..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {occasions.map((occasion) => (
                            <SelectItem key={occasion} value={occasion}>
                              {occasion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Get Suggestion
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <div className="h-full">
            {isLoading && (
                 <div className="flex items-center justify-center h-full min-h-[400px] rounded-xl border border-dashed border-border text-center bg-card">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-lg font-medium">Styling your outfit...</p>
                        <p className="text-sm">This may take a moment.</p>
                    </div>
                </div>
            )}
            
            {!isLoading && !suggestion && (
                <div className="flex items-center justify-center h-full min-h-[400px] rounded-xl border border-dashed border-border text-center bg-card">
                    <div className="p-10">
                        <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h2 className="mt-4 text-2xl font-headline tracking-tight">Ready for inspiration?</h2>
                        <p className="mt-2 text-muted-foreground">Select an occasion and let us work our magic.</p>
                    </div>
                </div>
            )}
            
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {suggestion && (
                <Card className="h-full animate-in fade-in-50 duration-500">
                    <CardContent className="p-8">
                        <h3 className="font-headline text-2xl mb-4 text-primary">Your Outfit Suggestion</h3>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-lg mb-2">Outfit:</h4>
                                <p className="text-lg leading-relaxed bg-muted p-4 rounded-lg">{suggestion.outfitSuggestion}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-lg mb-2">Stylist's Note:</h4>
                                <p className="text-lg leading-relaxed ">{suggestion.reasoning}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
