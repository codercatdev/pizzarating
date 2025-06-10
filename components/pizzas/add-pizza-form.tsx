'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Pizza } from 'lucide-react';

interface AddPizzaFormData {
  name: string;
  description: string;
  imageUrl?: string;
}

interface AddPizzaFormProps {
  eventId: string;
  userId: string;
  onSuccess: () => void;
}

export function AddPizzaForm({ eventId, userId, onSuccess }: AddPizzaFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddPizzaFormData>();

  const onSubmit = async (data: AddPizzaFormData) => {
    try {
      setLoading(true);
      const pizzaData = {
        ...data,
        eventId,
        createdBy: userId,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'pizzas'), pizzaData);

      toast({
        title: 'Success!',
        description: 'Pizza has been added to the event.',
      });

      reset();
      onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add pizza. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-dashed border-amber-200 hover:border-amber-300 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Pizza className="h-5 w-5" />
          Add New Pizza
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Pizza Name</Label>
            <Input
              id="name"
              {...register('name', { required: 'Pizza name is required' })}
              placeholder="e.g., Margherita Supreme"
            />
            {errors.name && (
              <span className="text-sm text-red-500">{errors.name.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              placeholder="Describe this delicious pizza..."
              className="min-h-[80px]"
            />
            {errors.description && (
              <span className="text-sm text-red-500">{errors.description.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <Input
              id="imageUrl"
              type="url"
              {...register('imageUrl')}
              placeholder="https://example.com/pizza-image.jpg"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600" disabled={loading}>
            {loading ? 'Adding Pizza...' : 'Add Pizza'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}