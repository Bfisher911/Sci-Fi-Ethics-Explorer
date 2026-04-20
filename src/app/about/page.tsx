
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Zap, Target, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-slate-900 text-foreground">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary font-headline flex items-center">
          <Zap className="inline-block mr-2 h-7 w-7" />
          Sci-Fi Ethics Explorer
        </Link>
        <nav>
          <Button asChild variant="outline" className="mr-2">
            <Link href="/stories">Explore Dilemmas</Link>
          </Button>
          {/* 🔁 PATCH: Update Login/Sign Up link to point to new /login page (BF 2025-06-06) */}
          <Button asChild variant="ghost">
            <Link href="/login">Login / Sign Up</Link>
          </Button>
          {/* 🔁 END PATCH */}
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-primary font-headline">About Sci-Fi Ethics Explorer</h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            A teaching site for the ethics of technology, read through the science fiction that has been rehearsing these problems since Frankenstein.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-semibold mb-6 text-accent font-headline">What it is <Target className="inline ml-2 h-7 w-7"/></h2>
            <p className="text-lg text-foreground/90 mb-4 leading-relaxed">
              The premise is simple: science fiction has been stress-testing the ethics of technology for two centuries. Reading it carefully is one of the better ways to learn how to think about the technology you actually use.
            </p>
            <p className="text-lg text-foreground/90 mb-4 leading-relaxed">
              The site has three working parts:
            </p>
            <ul className="list-disc list-inside space-y-2 text-lg text-foreground/90 mb-6 pl-4">
              <li>A twelve-chapter textbook on the ethics of technology, grounded in fiction from Shelley to Le Guin to Gibson.</li>
              <li>A library of branching dilemmas where your choices change the ending.</li>
              <li>A debate arena and a set of analysis tools, including an AI counselor trained on the textbook material.</li>
            </ul>
            <p className="text-lg text-foreground/90 leading-relaxed">
              The point is not to tell you what to think. It is to give you enough practice with the arguments that you know what you think, and why.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center"><BookOpen className="mr-2"/>Stories</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Branching dilemmas where the choices are yours and the consequences play out. Short fiction companions to every textbook chapter.</p>
              </CardContent>
            </Card>
            <Card className="bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center"><Zap className="mr-2"/>Analysis tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p>An AI counselor for talking through an argument, a framework explorer that maps your answers onto ethical traditions, and perspective comparisons that surface the ones you missed.</p>
              </CardContent>
            </Card>
            <Card className="bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center"><Users className="mr-2"/>Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Submit your own dilemmas. Argue open positions in the debate arena. Other readers are working through the same questions, and their answers are part of the material.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center mt-20">
            <h2 className="text-3xl font-semibold mb-6 text-accent font-headline">Who it is for</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Built for classrooms, but not limited to them. Undergrads, curious readers, anyone trying to think more clearly about the technology they use every day.
            </p>
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/stories">Read a dilemma</Link>
            </Button>
        </div>

      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Sci-Fi Ethics Explorer. All rights reserved.</p>
      </footer>
    </div>
  );
}
