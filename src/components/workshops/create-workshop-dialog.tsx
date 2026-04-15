'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { createWorkshop } from '@/app/actions/workshops';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Loader2, Video, MapPin, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateWorkshopDialogProps {
  onCreated?: (workshopId: string) => void;
}

type LocationType = 'online' | 'in_person' | 'hybrid';

/**
 * Dialog for creating a new collaborative workshop.
 */
export function CreateWorkshopDialog({ onCreated }: CreateWorkshopDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(20);
  const [locationType, setLocationType] = useState<LocationType>('online');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const needsMeetingUrl = locationType === 'online' || locationType === 'hybrid';
  const needsAddress = locationType === 'in_person' || locationType === 'hybrid';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || isSubmitting) return;

    if (needsMeetingUrl && meetingUrl.trim() && !meetingUrl.trim().toLowerCase().startsWith('http')) {
      toast({
        title: 'Invalid URL',
        description: 'Meeting URL must start with http or https.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createWorkshop({
        title: title.trim(),
        description: description.trim(),
        hostId: user.uid,
        hostName: user.displayName ?? 'Anonymous',
        maxParticipants,
        locationType,
        meetingUrl: needsMeetingUrl ? meetingUrl.trim() : undefined,
        locationAddress: needsAddress ? locationAddress.trim() : undefined,
      });

      if (result.success) {
        toast({ title: 'Workshop created', description: 'Your workshop is ready.' });
        setOpen(false);
        setTitle('');
        setDescription('');
        setMeetingUrl('');
        setLocationAddress('');
        setLocationType('online');
        onCreated?.(result.data);
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to create workshop:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Workshop
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create a Workshop</DialogTitle>
          <DialogDescription>
            Set up a collaborative space for ethical discussions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workshop-title">Title</Label>
            <Input
              id="workshop-title"
              placeholder="Workshop title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workshop-desc">Description</Label>
            <Textarea
              id="workshop-desc"
              placeholder="What will this workshop explore?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="min-h-[80px] resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-participants">Max Participants</Label>
            <Input
              id="max-participants"
              type="number"
              min={2}
              max={100}
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Location Type</Label>
            <RadioGroup
              value={locationType}
              onValueChange={(v) => setLocationType(v as LocationType)}
              className="flex flex-col gap-2 sm:flex-row sm:gap-4"
            >
              <Label
                htmlFor="loc-online"
                className="flex items-center gap-2 cursor-pointer"
              >
                <RadioGroupItem value="online" id="loc-online" />
                <Video className="h-4 w-4" /> Online
              </Label>
              <Label
                htmlFor="loc-in-person"
                className="flex items-center gap-2 cursor-pointer"
              >
                <RadioGroupItem value="in_person" id="loc-in-person" />
                <MapPin className="h-4 w-4" /> In Person
              </Label>
              <Label
                htmlFor="loc-hybrid"
                className="flex items-center gap-2 cursor-pointer"
              >
                <RadioGroupItem value="hybrid" id="loc-hybrid" />
                <LinkIcon className="h-4 w-4" /> Hybrid
              </Label>
            </RadioGroup>
          </div>

          {needsMeetingUrl && (
            <div className="space-y-2">
              <Label htmlFor="meeting-url">Meeting URL</Label>
              <Input
                id="meeting-url"
                type="url"
                placeholder="https://zoom.us/j/..."
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}

          {needsAddress && (
            <div className="space-y-2">
              <Label htmlFor="location-address">Location / Address</Label>
              <Input
                id="location-address"
                placeholder="Room 302, Main Hall, 123 Main St..."
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
