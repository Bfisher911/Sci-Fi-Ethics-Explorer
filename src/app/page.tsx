import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Zap } from 'lucide-react';
import Image from 'next/image';
import { DilemmaOfTheDay } from '@/components/home/dilemma-of-the-day';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-slate-900 text-foreground">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary font-headline">
          <Zap className="inline-block mr-2 h-7 w-7" />
          Sci-Fi Ethics Explorer
        </h1>
        <nav>
          <Button asChild variant="outline">
            <Link href="/stories">Explore Dilemmas</Link>
          </Button>
          <Button asChild variant="ghost" className="ml-2">
            <Link href="/auth">Login / Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 md:py-20 flex flex-col items-center text-center">
        <h2 className="text-5xl md:text-6xl font-bold mb-6 font-headline leading-tight">
          Navigate the Moral Maze of the Future.
        </h2>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl">
          Dive into thought-provoking ethical dilemmas inspired by science fiction. Analyze scenarios, explore theories, and ponder the consequences of technological advancement.
        </p>
        <div className="flex gap-4 mb-16">
          <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/stories">
              Start Exploring <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" asChild variant="secondary">
            <Link href="/about">Learn More</Link>
          </Button>
        </div>

        <DilemmaOfTheDay />

        <section className="mt-20 w-full max-w-5xl">
          <h3 className="text-3xl font-bold mb-8 text-center font-headline">Why Explore Sci-Fi Ethics?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-primary flex items-center"><Zap className="mr-2"/>Future-Proof Your Thinking</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Prepare for the ethical challenges of tomorrow by engaging with them today.</p>
              </CardContent>
            </Card>
            <Card className="bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-primary flex items-center"><Zap className="mr-2"/>Expand Your Perspective</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Consider diverse viewpoints and complex moral landscapes in captivating narratives.</p>
              </CardContent>
            </Card>
            <Card className="bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-primary flex items-center"><Zap className="mr-2"/>Join the Conversation</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Engage with a community passionate about the intersection of technology and ethics.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Sci-Fi Ethics Explorer. All rights reserved.</p>
        <p className="text-sm">An educational project for exploring complex ethical questions.</p>
      </footer>
    </div>
  );
}
