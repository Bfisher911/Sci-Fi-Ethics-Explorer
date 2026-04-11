import { DebateTopicCard } from '@/components/debate-arena/debate-topic-card';
import { mockStories } from '@/data/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Swords, MessageCircle } from 'lucide-react';

export default function DebateArenaPage() {
  // Use a dilemma from mock stories as a placeholder topic
  const debateTopicDilemma = mockStories.find(story => story.id === 'cryosleep-conundrum') || mockStories[0];

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
         <h1 className="text-4xl font-bold mb-4 text-primary font-headline flex items-center">
            <Swords className="mr-3 h-10 w-10" /> Debate Arena
         </h1>
          <p className="text-lg text-muted-foreground">
            Engage in structured debates on pressing ethical dilemmas from the world of science fiction. 
            (Feature under construction)
          </p>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <DebateTopicCard dilemma={debateTopicDilemma} />

        <Card className="bg-card/70 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
                <MessageCircle className="h-12 w-12 text-accent mx-auto mb-4"/>
                <h2 className="text-2xl font-semibold text-accent">Future Functionality</h2>
                <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
                    This section will host live and asynchronous debates. Users will be able to:
                </p>
                <ul className="list-disc list-inside text-left max-w-md mx-auto mt-4 text-muted-foreground space-y-1">
                    <li>Join debate teams (Pro/Con).</li>
                    <li>Submit arguments and rebuttals.</li>
                    <li>Vote on winning arguments.</li>
                    <li>View debate archives and summaries.</li>
                </ul>
                <p className="mt-6 text-sm text-primary font-semibold">Stay tuned for updates!</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
