import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface CreateEventFormData {
  title: string;
  description: string;
  date: string;
  location: string;
}

interface CreateEventFormProps {
  userId: string;
}

export function CreateEventForm({ userId }: CreateEventFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateEventFormData>();

  const onSubmit = async (data: CreateEventFormData) => {
    try {
      setLoading(true);
      const eventData = {
        ...data,
        createdBy: userId,
        participants: [userId],
        status: 'upcoming',
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'events'), eventData);

      toast({
        title: 'Success!',
        description: 'Your pizza event has been created.',
      });

      router.push(`/events/${docRef.id}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create event. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              {...register('title', { required: true })}
              placeholder="e.g., Pizza Night at Joe's"
            />
            {errors.title && (
              <span className="text-sm text-red-500">Title is required</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description', { required: true })}
              placeholder="Tell everyone what to expect..."
            />
            {errors.description && (
              <span className="text-sm text-red-500">Description is required</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="datetime-local"
              {...register('date', { required: true })}
            />
            {errors.date && (
              <span className="text-sm text-red-500">Date is required</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...register('location', { required: true })}
              placeholder="Where's the pizza happening?"
            />
            {errors.location && (
              <span className="text-sm text-red-500">Location is required</span>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Event...' : 'Create Event'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}