import type { Story } from '@/types'; // Assuming dilemmas are based on Story type for now
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Users, CalendarDays } from 'lucide-react'; // Zap for "Hot Topic"
import Link from 'next/link';

interface DebateTopicCardProps {
  dilemma: Story; // Using Story type as a base for dilemma structure
}

export function DebateTopicCard({ dilemma }: DebateTopicCardProps) {
  return (
    <Card className="shadow-xl hover:shadow-accent/30 transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="destructive" className="bg-accent text-accent-foreground">
            <Zap className="h-4 w-4 mr-1.5" /> Hot Topic
          </Badge>
          <div className="text-xs text-muted-foreground flex items-center">
             <CalendarDays className="h-4 w-4 mr-1.5"/> Debate Opens: Coming Soon
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-primary">{dilemma.title}</CardTitle>
        <CardDescription className="text-md text-foreground/80 pt-1">
          {dilemma.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">{dilemma.genre}</Badge>
          <Badge variant="outline">{dilemma.theme}</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h4 className="font-semibold text-lg text-green-400">Affirmative Position (Pro)</h4>
                <p className="text-sm text-muted-foreground">Argue in favor of a specific stance related to the dilemma.</p>
                {/* Placeholder for key arguments or top debater */}
            </div>
             <div>
                <h4 className="font-semibold text-lg text-red-400">Negative Position (Con)</h4>
                <p className="text-sm text-muted-foreground">Argue against the affirmative stance or propose an alternative.</p>
                 {/* Placeholder for key arguments or top debater */}
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col md:flex-row justify-between items-center border-t pt-4">
        <div className="text-sm text-muted-foreground mb-2 md:mb-0 flex items-center">
            <Users className="h-4 w-4 mr-1.5"/> Participants: TBD
        </div>
        <div className="flex gap-2">
        <Button variant="outline" disabled>
          View Arguments (Soon)
        </Button>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled>
          Join Debate (Soon)
        </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
