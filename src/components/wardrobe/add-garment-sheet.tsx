'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Upload, Loader2, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

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
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Textarea } from '@/components/ui/textarea';
import { categories, conditions, sizes } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  category: z.string().min(1, 'Category is required.'),
  size: z.string().min(1, 'Size is required.'),
  condition: z.string().min(1, 'Condition is required.'),
  tags: z.string().optional(),
  images: z.instanceof(FileList).refine((files) => files?.length > 0, 'At least one image is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export function AddGarmentSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const storage = getStorage();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      size: '',
      condition: '',
      tags: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      form.setValue('images', files);
      const newPreviews = Array.from(files).map((file) => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };
  
  const resetForm = () => {
    form.reset();
    setPreviews([]);
    setIsLoading(false);
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to add an item.',
        });
        return;
    }

    setIsLoading(true);
    
    try {
      // 1. Create a preliminary document in Firestore to get an ID
      const itemRef = await addDoc(collection(db, "items"), {
          name: data.name,
          description: data.description,
          category: data.category,
          size: data.size,
          condition: data.condition,
          tags: data.tags || '',
          imageUrls: [], // temporary empty array
          uploader: user.uid,
          timestamp: serverTimestamp(),
          availability: true,
          approved: false, // Default to not approved
      });

      // 2. Upload images to Storage
      const imageUrls = await Promise.all(
        Array.from(data.images).map(async (file) => {
          const storageRef = ref(storage, `images/${user.uid}/${itemRef.id}/${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          return getDownloadURL(snapshot.ref);
        })
      );
      
      // 3. Update the document with image URLs
      await updateDoc(doc(db, "items", itemRef.id), { imageUrls });

      toast({
        title: 'Success!',
        description: `Your item has been submitted for approval.`,
      });

      setIsOpen(false);
      resetForm();

    } catch (error: any) {
      console.error("Error adding item:", error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'There was a problem adding your item.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
            resetForm();
        }
    }}>
      <SheetTrigger asChild>
        <Button size="lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Item
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">List a New Item</SheetTitle>
          <SheetDescription>
            Fill out the details below to add a new garment to the marketplace.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4">
          <Form {...form}>
            <form id="add-item-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Vintage Denim Jacket" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your item in detail..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {conditions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., retro, 90s, oversized" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="images"
                render={() => (
                  <FormItem>
                    <FormLabel>Item Photos</FormLabel>
                     <FormControl>
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                          </div>
                          <Input id="dropzone-file" type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                    {previews.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {previews.map((src, index) => (
                                <div key={index} className="relative aspect-square">
                                    <Image src={src} alt={`Preview ${index + 1}`} fill className="object-cover rounded-md" />
                                </div>
                            ))}
                        </div>
                    )}
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
            <Button form="add-item-form" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Submitting...' : 'Submit for Approval'}
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
