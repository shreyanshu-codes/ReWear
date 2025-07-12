'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Upload, Loader2 } from 'lucide-react';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { describeGarment } from '@/ai/flows/describe-garment-flow';
import { newGarment } from '@/lib/data';

const formSchema = z.object({
  image: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddGarmentSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addGarment } = useWardrobe();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    // In a real app, you would read the file `data.image[0]`
    // and convert it to a data URI for the AI flow.
    // To simplify, we'll simulate the AI call.
    try {
      // const file = data.image[0];
      // const reader = new FileReader();
      // reader.readAsDataURL(file);
      // reader.onload = async () => {
      //   const result = await describeGarment({ photoDataUri: reader.result as string });
      //   addGarment({ ...result, imageUrl: URL.createObjectURL(file), id: 'new', name: 'New Item' });
      // };
      
      // Simulating AI call and result
      await new Promise(resolve => setTimeout(resolve, 1500));
      // const result = await describeGarment({ photoDataUri: '...'});
      // We use mock data instead of making a real AI call in this step
      addGarment(newGarment);

      toast({
        title: 'Success!',
        description: `${newGarment.name} has been added to your wardrobe.`,
      });

      setIsOpen(false);
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem describing your garment.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Item
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">Add a New Garment</SheetTitle>
          <SheetDescription>
            Upload a photo of your clothing item. Our AI will analyze and categorize it for you.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Garment Photo</FormLabel>
                    <FormControl>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-border border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (MAX. 800x400px)</p>
                                </div>
                                <Input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
                            </label>
                        </div> 
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <SheetFooter>
            <SheetClose asChild>
                <Button variant="outline" disabled={isLoading}>Cancel</Button>
            </SheetClose>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Analyzing...' : 'Add to Wardrobe'}
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
