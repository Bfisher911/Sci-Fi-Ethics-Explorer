'use client';

import { useState } from 'react';
import { generateEthicsLearningReport } from '@/app/actions/ethical-reports';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2, Printer } from 'lucide-react';

function renderMarkdown(markdown: string) {
  return markdown.split('\n').map((line, index) => {
    if (line.startsWith('# ')) {
      return <h2 key={index} className="text-2xl font-bold text-primary mt-2">{line.slice(2)}</h2>;
    }
    if (line.startsWith('## ')) {
      return <h3 key={index} className="text-lg font-semibold text-primary mt-5">{line.slice(3)}</h3>;
    }
    if (line.startsWith('- ')) {
      return <p key={index} className="text-sm ml-4">- {line.slice(2)}</p>;
    }
    if (!line.trim()) return <div key={index} className="h-2" />;
    return <p key={index} className="text-sm leading-relaxed">{line}</p>;
  });
}

export function GenerateEthicsReportButton() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState('');

  async function handleGenerate() {
    if (!user?.uid) return;
    setLoading(true);
    const result = await generateEthicsLearningReport(user.uid);
    setLoading(false);
    if (!result.success) {
      toast({ title: 'Report not generated', description: result.error, variant: 'destructive' });
      return;
    }
    setMarkdown(result.data.markdown);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleGenerate} disabled={loading || !user?.uid} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          Generate Ethics Learning Report
        </Button>
        {markdown && (
          <Button type="button" variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        )}
      </div>
      {markdown && (
        <Card className="bg-background/60">
          <CardHeader>
            <CardTitle>Generated Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {renderMarkdown(markdown)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
