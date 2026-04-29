
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Zap } from 'lucide-react';
import Image from 'next/image';
import { DilemmaOfTheDay } from '@/components/home/dilemma-of-the-day';
import { SignedInRedirect } from '@/components/home/signed-in-redirect';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden text-foreground">
      {/* Auth-aware bounce: signed-in visitors land on /dashboard
          instead of the marketing splash. Renders nothing visually. */}
      <SignedInRedirect to="/dashboard" />
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.png"
          alt="Sci-Fi Background"
          fill
          className="object-cover opacity-30 scale-105"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950" />
      </div>

      <header className="container mx-auto px-4 py-8 flex justify-between items-center relative z-10">
        <h1 className="text-3xl font-bold tracking-tighter text-white font-headline flex items-center gap-2">
          <div className="h-8 w-1 bg-primary rounded-full" />
          Sci-Fi Ethics Explorer
        </h1>
        <nav className="flex items-center gap-4">
          <Button asChild variant="ghost" className="text-white hover:text-primary transition-colors">
            <Link href="/stories">Explore</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            <Link href="/login">Login</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 py-20 flex flex-col items-center text-center relative z-10">
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h2 className="text-6xl md:text-8xl font-bold mb-8 font-headline leading-tight tracking-tight text-white drop-shadow-2xl">
            The Future is <span className="text-primary italic">Questionable.</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            A serious look at the ethics of technology, read through the science fiction that has been rehearsing these problems since Frankenstein.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-24">
            <Button size="lg" asChild className="px-10 h-16 text-lg bg-primary hover:bg-primary/90 rounded-none transform skew-x-[-12deg]">
              <Link href="/stories" className="skew-x-[12deg] flex items-center gap-3">
                START EXPLORING <ArrowRight className="h-6 w-6" />
              </Link>
            </Button>
            <Button size="lg" asChild variant="outline" className="px-10 h-16 text-lg border-white/20 hover:bg-white/10 rounded-none bg-white/5 backdrop-blur-sm transform skew-x-[-12deg]">
              <Link href="/about" className="skew-x-[12deg]">
                LEARN MORE
              </Link>
            </Button>
          </div>
        </div>

        <div className="w-full flex justify-center py-10">
          <DilemmaOfTheDay />
        </div>

        <section className="mt-40 w-full max-w-6xl">
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: "Read", text: "Twelve chapters on the ethics of technology, grounded in fiction from Shelley to Le Guin to Gibson." },
              { title: "Decide", text: "Branching dilemmas where you cannot dodge the choice. Every path has consequences the story holds you to." },
              { title: "Argue", text: "Debate open positions with other readers. See how your ethical instincts map onto real frameworks." }
            ].map((item, i) => (
              <div key={i} className="group relative p-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-primary/50 transition-all duration-500 rounded-2xl text-left overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <Zap className="h-16 w-16 text-primary" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <div className="h-1 w-4 bg-primary rounded-full" />
                  {item.title}
                </h4>
                <p className="text-slate-400 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-16 border-t border-white/5 flex flex-col items-center gap-4 text-slate-500 relative z-10">
        <p className="text-sm tracking-widest uppercase">&copy; {new Date().getFullYear()} Sci-Fi Ethics Explorer</p>
        <div className="flex gap-8 text-xs">
          <Link href="/about" className="hover:text-primary transition-colors">About</Link>
          <Link href="/philosophers" className="hover:text-primary transition-colors">Archive</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
