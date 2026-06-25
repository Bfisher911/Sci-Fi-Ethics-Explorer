import { cn } from '@/lib/utils';
import type { ElementType, ReactNode } from 'react';

/**
 * Reveal — scroll-into-view entrance wrapper.
 *
 * Applies the `.reveal` class; the entrance itself is pure CSS driven by
 * a scroll timeline (see globals.css). Content is fully visible by
 * default and the animation only enhances it where supported and where
 * motion is allowed — so a section can never ship blank in a headless
 * render, a background tab, or with JS disabled. No client JS needed.
 */
interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Element to render. Defaults to a div. */
  as?: ElementType;
}

export function Reveal({
  children,
  className,
  as: Tag = 'div',
}: RevealProps): JSX.Element {
  return <Tag className={cn('reveal', className)}>{children}</Tag>;
}
