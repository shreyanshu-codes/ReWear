'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Upload, Loader2, FileImage } from 'lucide-react';
import Image from 'next/image';

import { useWardrobe } from '@/hooks/use-wardrobe';
import { useAuth } from '@/hooks/use-auth';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { describeGarment } from '@/ai/flows/describe-garment-flow';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const formSchema = z.object({
  image: z.instanceof(FileList).refine((files) => files?.length === 1, 'Image is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export function AddGarmentSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { addGarment } = useWardrobe();
  const { user } = useAuth();
  const { toast } = useToast();
  const storage = getStorage();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('image', e.target.files as FileList);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to add a garment.',
        });
        return;
    }

    setIsLoading(true);
    
    try {
      const file = data.image[0];
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = async () => {
        const photoDataUri = reader.result as string;
        
        const descriptionResult = await describeGarment({ photoDataUri });
        
        const garmentId = `${Date.now()}`;
        const storageRef = ref(storage, `images/${user.uid}/${garmentId}/${file.name}`);
        
        const snapshot = await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(snapshot.ref);

        addGarment({
          ...descriptionResult,
          id: garmentId,
          name: descriptionResult.category, // Use category as a sensible default name
          imageUrl: imageUrl,
        });

        toast({
          title: 'Success!',
          description: `${descriptionResult.category} has been added to your wardrobe.`,
        });

        setIsOpen(false);
        form.reset();
        setPreview(null);
      };
    } catch (error: any) {
      console.error("Error adding garment:", error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'There was a problem adding your garment.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
            form.reset();
            setPreview(null);
        }
    }}>
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
                render={() => (
                  <FormItem>
                    <FormLabel>Garment Photo</FormLabel>
                    <FormControl>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-border border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted relative">
                                {preview ? (
                                    <Image src={preview} alt="Garment preview" fill className="object-cover rounded-lg" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG or WEBP</p>
                                    </div>
                                )}
                                <Input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
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
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading || !preview}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Analyzing...' : 'Add to Wardrobe'}
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
