'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { exportToPdf } from '@/lib/pdf-export';

interface ExportButtonProps {
  targetId: string;
  filename: string;
}

export function ExportButton({ targetId, filename }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  function handleExport(): void {
    setLoading(true);
    try {
      exportToPdf(targetId, filename);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      // Give the print dialog time to appear
      setTimeout(() => setLoading(false), 500);
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      Export Report
    </Button>
  );
}
