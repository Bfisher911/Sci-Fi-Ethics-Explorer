'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Film, BookOpen, Tv, Gamepad2, Clapperboard } from 'lucide-react';
import { getSciFiMedia } from '@/app/actions/scifi-media';
import { MediaCard } from '@/components/scifi-media/media-card';
import type { SciFiMedia, SciFiMediaCategory } from '@/types';

const TABS: { value: string; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All', icon: Clapperboard },
  { value: 'movie', label: 'Movies', icon: Film },
  { value: 'book', label: 'Books', icon: BookOpen },
  { value: 'tv', label: 'TV Shows', icon: Tv },
  { value: 'other', label: 'Games & Other', icon: Gamepad2 },
];

export default function SciFiMediaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') || 'all';

  const [media, setMedia] = useState<SciFiMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    async function fetchData(): Promise<void> {
      const result = await getSciFiMedia();
      if (result.success) setMedia(result.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const lower = searchTerm.toLowerCase();
  const filtered = media.filter((m) => {
    if (activeTab !== 'all' && m.category !== activeTab) return false;
    if (!lower) return true;
    return (
      m.title.toLowerCase().includes(lower) ||
      m.creator.toLowerCase().includes(lower) ||
      m.ethicsExplored.some((e) => e.toLowerCase().includes(lower)) ||
      m.relatedFrameworks.some((f) => f.toLowerCase().includes(lower))
    );
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = tab === 'all' ? '/scifi-media' : `/scifi-media?tab=${tab}`;
    router.replace(url, { scroll: false });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <h1 className="text-4xl font-bold mb-4 text-primary font-headline flex items-center gap-3">
            <Clapperboard className="h-9 w-9" />
            Sci-Fi Media & Technology Ethics
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Films, novels, TV series, and games that stress-test our ethical
            intuitions about AI, genetic engineering, surveillance,
            consciousness, and the futures we are building. Each entry maps
            the ethical territory the work explores, connects it to the
            ethical frameworks in our glossary, and links to the authors who
            wrote or inspired it.
          </p>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-4">
            <TabsList className="flex flex-wrap gap-1 h-auto bg-muted/40">
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title, creator, theme, or framework..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-2/3"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <MediaCard key={item.id} media={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-2xl text-muted-foreground">
            No media matches your search.
          </p>
        </div>
      )}
    </div>
  );
}
