
'use client';

import { GraduationCap, Presentation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { AccountRole } from '@/types';
import { cn } from '@/lib/utils';

interface RoleSelectorProps {
  selectedRole: AccountRole | null;
  onSelect: (role: AccountRole) => void;
}

const roles: {
  value: AccountRole;
  title: string;
  description: string;
  icon: typeof GraduationCap;
}[] = [
  {
    value: 'student',
    title: 'Student',
    description:
      'Join communities, complete activities, and explore ethical scenarios',
    icon: GraduationCap,
  },
  {
    value: 'instructor',
    title: 'Instructor',
    description:
      'Create communities, assign work, track progress, and teach through ethical exploration',
    icon: Presentation,
  },
];

/**
 * Side-by-side card selector for choosing an account role at signup.
 */
export function RoleSelector({ selectedRole, onSelect }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {roles.map(({ value, title, description, icon: Icon }) => {
        const isSelected = selectedRole === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className="text-left"
          >
            <Card
              className={cn(
                'h-full cursor-pointer transition-all duration-200 hover:border-primary/50',
                isSelected
                  ? 'border-2 border-primary bg-primary/5 shadow-md'
                  : 'border border-border bg-card/80 backdrop-blur-sm'
              )}
            >
              <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                <Icon
                  className={cn(
                    'h-8 w-8',
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isSelected ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {title}
                </p>
                <p className="text-xs text-muted-foreground leading-snug">
                  {description}
                </p>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
