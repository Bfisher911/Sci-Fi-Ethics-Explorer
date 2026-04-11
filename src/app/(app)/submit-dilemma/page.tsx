import { SubmitDilemmaForm } from '@/components/submit-dilemma/submit-dilemma-form';
import { Card, CardContent } from '@/components/ui/card';

export default function SubmitDilemmaPage() {
  return (
    <div className="container mx-auto py-8 px-4">
       <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <h1 className="text-4xl font-bold mb-4 text-primary font-headline">Submit Your Dilemma</h1>
          <p className="text-lg text-muted-foreground">
            Have a compelling sci-fi ethical scenario in mind? Share it with the community!
            Approved submissions will be featured for others to explore and discuss.
          </p>
        </CardContent>
      </Card>
      <SubmitDilemmaForm />
    </div>
  );
}
