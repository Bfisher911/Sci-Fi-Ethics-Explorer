import Image from 'next/image';
import type { SubmittedDilemma } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, ThumbsUp } from 'lucide-react'; // Example icons

interface CommunityDilemmaCardProps {
  dilemma: SubmittedDilemma;
}

export function CommunityDilemmaCard({ dilemma }: CommunityDilemmaCardProps) {
  const formattedDate = dilemma.submittedAt instanceof Date 
    ? dilemma.submittedAt.toLocaleDateString()
    // @ts-ignore
    : (dilemma.submittedAt?.seconds ? new Date(dilemma.submittedAt.seconds * 1000).toLocaleDateString() : 'N/A');


  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-primary/30 transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
      {dilemma.imageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={dilemma.imageUrl}
            alt={dilemma.title}
            layout="fill"
            objectFit="cover"
            data-ai-hint={dilemma.imageHint || 'community sci-fi concept'}
          />
        </div>
      )}
      {!dilemma.imageUrl && (
         <div className="relative w-full h-48 bg-muted flex items-center justify-center">
           <Image 
            src={`https://placehold.co/600x400.png?text=${encodeURIComponent(dilemma.title.substring(0,20))}`} 
            alt={dilemma.title} 
            layout="fill"
            objectFit="cover"
            data-ai-hint={dilemma.imageHint || dilemma.theme.toLowerCase() || "abstract concept"}
            />
         </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">{dilemma.title}</CardTitle>
        <Badge variant="secondary" className="w-fit mt-1">{dilemma.theme}</Badge>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-sm text-foreground/80 line-clamp-4">{dilemma.description}</CardDescription>
      </CardContent>
      <CardFooter className="border-t pt-4 text-xs text-muted-foreground space-y-1 md:space-y-0 md:flex md:justify-between md:items-center">
        <div className="flex items-center">
          <User className="h-3.5 w-3.5 mr-1.5" /> Submitted by: {dilemma.authorName}
        </div>
        <div className="flex items-center">
          <Calendar className="h-3.5 w-3.5 mr-1.5" /> {formattedDate}
        </div>
        {/* Placeholder for upvotes/engagement */}
        {/* <div className="flex items-center">
          <ThumbsUp className="h-3.5 w-3.5 mr-1.5 text-green-400" /> {Math.floor(Math.random() * 100)}
        </div> */}
      </CardFooter>
    </Card>
  );
}
