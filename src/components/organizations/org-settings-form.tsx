
'use client';

import { useState, type FormEvent } from 'react';
import type { Organization } from '@/types';
import { updateOrganizationSettings } from '@/app/actions/organizations';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Loader2, Save } from 'lucide-react';

interface OrgSettingsFormProps {
  organization: Organization;
  requesterId: string;
  onSaved?: () => void;
}

/**
 * Settings form for editing organization details. Only accessible by the owner.
 */
export function OrgSettingsForm({
  organization,
  requesterId,
  onSaved,
}: OrgSettingsFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState(organization.name);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Organization name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateOrganizationSettings(organization.id, requesterId, {
        name: name.trim(),
      });

      if (result.success) {
        toast({
          title: 'Settings Updated',
          description: 'Organization settings have been saved.',
        });
        onSaved?.();
      } else {
        toast({
          title: 'Update Failed',
          description: result.error || 'Could not update settings.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = organization.features || {};

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>
            Manage your organization name and details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="bg-background/50 max-w-md"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your organization subscription details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="outline" className="text-base px-4 py-1">
            {(organization.plan || 'free').charAt(0).toUpperCase() +
              (organization.plan || 'free').slice(1)}
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>Features enabled for your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(features).map(([key, enabled]) => (
              <Badge
                key={key}
                variant="outline"
                className={
                  enabled
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-muted text-muted-foreground'
                }
              >
                {key}: {enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            ))}
            {Object.keys(features).length === 0 && (
              <p className="text-muted-foreground text-sm">No feature flags configured.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
