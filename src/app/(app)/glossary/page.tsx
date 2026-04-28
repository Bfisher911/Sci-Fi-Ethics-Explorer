'use client';

import { TheoryCard } from '@/components/glossary/theory-card';
import { mockEthicalTheories } from '@/data/mock-data';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function GlossaryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTheories = mockEthicalTheories.filter(theory =>
    theory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    theory.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (theory.proponents && theory.proponents.join(' ').toLowerCase().includes(searchTerm.toLowerCase())) ||
    (theory.keyConcepts && theory.keyConcepts.join(' ').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <h1 className="text-4xl font-bold mb-4 text-primary font-headline">Ethical Frameworks</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Explore the foundational ethical frameworks you&apos;ll use across the platform &mdash; the lenses you can hold up to any decision, story, or system.
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search theories, concepts, or proponents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-1/2"
            />
          </div>
        </CardContent>
      </Card>

      {filteredTheories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTheories.map((theory) => (
            <TheoryCard key={theory.id} theory={theory} />
          ))}
        </div>
      ) : (
         <div className="text-center py-12">
          <p className="text-2xl text-muted-foreground">No theories match your search.</p>
          <p className="text-md text-muted-foreground/80 mt-2">Try a different keyword.</p>
        </div>
      )}
    </div>
  );
}
