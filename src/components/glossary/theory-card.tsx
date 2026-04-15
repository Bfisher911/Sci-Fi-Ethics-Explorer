import Link from 'next/link';
import Image from 'next/image';
import type { EthicalTheory } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, MessageSquare, ArrowRight } from 'lucide-react';

interface TheoryCardProps {
  theory: EthicalTheory;
}

export function TheoryCard({ theory }: TheoryCardProps) {
  return (
    <Link
      href={`/glossary/${theory.id}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
    >
      <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-primary/30 group-hover:border-primary/40 transition-all duration-300 bg-card/80 backdrop-blur-sm cursor-pointer">
        {theory.imageUrl && (
          <div className="relative w-full h-48">
            <Image
              src={theory.imageUrl}
              alt={theory.name}
              layout="fill"
              objectFit="cover"
              data-ai-hint={theory.imageHint || 'abstract concept'}
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary group-hover:text-accent transition-colors">
            {theory.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
          <CardDescription className="text-sm text-foreground/80 line-clamp-4">{theory.description}</CardDescription>

          {theory.proponents && theory.proponents.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center"><Users className="h-4 w-4 mr-1.5" />Proponents:</h4>
              <div className="flex flex-wrap gap-1">
                {theory.proponents.slice(0, 4).map(p => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}
                {theory.proponents.length > 4 && (
                  <Badge variant="secondary" className="text-xs">+{theory.proponents.length - 4}</Badge>
                )}
              </div>
            </div>
          )}

          {theory.keyConcepts && theory.keyConcepts.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center"><BookOpen className="h-4 w-4 mr-1.5" />Key Concepts:</h4>
              <div className="flex flex-wrap gap-1">
                {theory.keyConcepts.slice(0, 4).map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                {theory.keyConcepts.length > 4 && (
                  <Badge variant="outline" className="text-xs">+{theory.keyConcepts.length - 4}</Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-3 flex items-center justify-between text-xs">
          {theory.exampleScenario ? (
            <div className="text-muted-foreground line-clamp-1 flex-1 mr-2">
              <span className="font-semibold flex items-center inline-flex"><MessageSquare className="h-3 w-3 mr-1 text-accent" /></span>
              <span className="italic">{theory.exampleScenario}</span>
            </div>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-1 text-primary group-hover:text-accent transition-colors font-semibold whitespace-nowrap">
            Learn more <ArrowRight className="h-3 w-3" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
