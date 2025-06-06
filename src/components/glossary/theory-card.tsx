import Image from 'next/image';
import type { EthicalTheory } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, MessageSquare } from 'lucide-react'; // Example icons

interface TheoryCardProps {
  theory: EthicalTheory;
}

export function TheoryCard({ theory }: TheoryCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-primary/30 transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
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
        <CardTitle className="text-xl font-semibold text-primary">{theory.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <CardDescription className="text-sm text-foreground/80 line-clamp-4">{theory.description}</CardDescription>
        
        {theory.proponents && theory.proponents.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center"><Users className="h-4 w-4 mr-1.5" />Proponents:</h4>
            <div className="flex flex-wrap gap-1">
              {theory.proponents.map(p => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}
            </div>
          </div>
        )}

        {theory.keyConcepts && theory.keyConcepts.length > 0 && (
           <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center"><BookOpen className="h-4 w-4 mr-1.5" />Key Concepts:</h4>
            <div className="flex flex-wrap gap-1">
              {theory.keyConcepts.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
            </div>
          </div>
        )}
      </CardContent>
      {theory.exampleScenario && (
        <CardFooter className="border-t pt-3">
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold flex items-center"><MessageSquare className="h-4 w-4 mr-1.5 text-accent" />Example:</p>
            <p className="italic">{theory.exampleScenario}</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
