import { EthicalFrameworkQuiz } from '@/components/framework-explorer/ethical-framework-quiz';
import { Card, CardContent } from '@/components/ui/card';

export default function FrameworkExplorerPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
            <h1 className="text-4xl font-bold mb-4 text-primary font-headline">Ethical Framework Explorer</h1>
            <p className="text-lg text-muted-foreground">
                Discover which ethical theories resonate most with your decision-making style.
                Answer a series of questions to see your alignment with different frameworks.
            </p>
        </CardContent>
      </Card>
      <EthicalFrameworkQuiz />
    </div>
  );
}
