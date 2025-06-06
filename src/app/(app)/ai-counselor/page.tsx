'use client';

import { AICounselorChat } from '@/components/ai-counselor/ai-counselor-chat';
import { Card, CardContent } from '@/components/ui/card';

export default function AICounselorPage() {
  return (
    <div className="container mx-auto py-8 px-4 flex flex-col h-[calc(100vh-var(--header-height,10rem))]"> {/* Adjust header height as needed */}
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <h1 className="text-4xl font-bold mb-4 text-primary font-headline">AI Ethics Counselor</h1>
          <p className="text-lg text-muted-foreground">
            Discuss your ethical dilemmas, explore different perspectives, and gain insights from our specialized AI counselor.
            Start by typing your question or concern below.
          </p>
        </CardContent>
      </Card>
      
      <div className="flex-grow flex flex-col">
        <AICounselorChat />
      </div>
    </div>
  );
}
