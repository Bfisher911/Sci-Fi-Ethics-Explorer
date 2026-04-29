'use client';

/**
 * Visual settings card on /profile.
 *
 * Hosts the ThemeSwitcher (default / low-stim / high-contrast). Future
 * accessibility/visual prefs land here too — text size, line-height,
 * etc.
 */

import { Eye } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';

export function VisualSettingsCard(): JSX.Element {
  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Visual settings
        </CardTitle>
        <CardDescription>
          Pick a presentation theme that suits your eyes and reading style.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ThemeSwitcher />
      </CardContent>
    </Card>
  );
}
