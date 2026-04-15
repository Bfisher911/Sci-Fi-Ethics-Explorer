
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-slate-900 p-4">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group"
        aria-label="Sci-Fi Ethics Explorer home"
      >
        <div className="h-8 w-1 bg-primary rounded-full group-hover:h-10 transition-all" />
        <Sparkles className="h-5 w-5" />
        <span className="font-headline text-xl font-bold tracking-tight">
          Sci-Fi Ethics Explorer
        </span>
      </Link>
      {children}
    </div>
  );
}
