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
          <Button asChild variant="ghost">
            <Link href="/auth">Login / Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-primary font-headline">About Sci-Fi Ethics Explorer</h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Delving into the moral fabric of imagined futures to better understand our present and shape a more ethical tomorrow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-semibold mb-6 text-accent font-headline">Our Mission <Target className="inline ml-2 h-7 w-7"/></h2>
            <p className="text-lg text-foreground/90 mb-4 leading-relaxed">
              Sci-Fi Ethics Explorer is an educational platform dedicated to fostering critical thinking about the ethical implications of science and technology. Through engaging narratives, interactive scenarios, and AI-powered analysis, we aim to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-lg text-foreground/90 mb-6 pl-4">
              <li>Make complex ethical concepts accessible and engaging.</li>
              <li>Encourage exploration of diverse philosophical perspectives.</li>
              <li>Stimulate thoughtful discussion about future technologies and their societal impact.</li>
              <li>Provide tools for analyzing and navigating moral dilemmas.</li>
            </ul>
            <p className="text-lg text-foreground/90 leading-relaxed">
              We believe that by grappling with the challenges of fictional futures, we can develop the wisdom and foresight needed for our own rapidly evolving world.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center"><BookOpen className="mr-2"/>Interactive Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Engage with stories where your choices matter, and see their ethical outcomes unfold.</p>
              </CardContent>
            </Card>
            <Card className="bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center"><Zap className="mr-2"/>AI-Powered Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Utilize AI tools to analyze scenarios, understand ethical frameworks, and chat with a virtual counselor.</p>
              </CardContent>
            </Card>
            <Card className="bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center"><Users className="mr-2"/>Community Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Submit your own dilemmas, participate in discussions, and learn from a community of explorers.</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="text-center mt-20">
            <h2 className="text-3xl font-semibold mb-6 text-accent font-headline">Join the Exploration</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Whether you're a student, educator, sci-fi enthusiast, or simply curious about the future, there's a place for you here.
            </p>
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/stories">Begin Your Journey</Link>
            </Button>
        </div>

      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Sci-Fi Ethics Explorer. All rights reserved.</p>
      </footer>
    </div>
  );
}
